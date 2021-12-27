{-# LANGUAGE NumericUnderscores         #-}
{-# LANGUAGE DataKinds                  #-}
{-# LANGUAGE OverloadedStrings          #-}
{-# LANGUAGE TypeApplications           #-}

module Market.Offchain
    ( endpoints
    )
    where

import qualified Data.Map                  as Map
import           Data.Monoid               as Mnd ( (<>), mconcat )
import           Control.Monad             ( void, forever )
import           Data.Aeson                (ToJSON)
import           Data.Text                 (Text)
import           Prelude                   (String, fromIntegral, ceiling, Float, (*), (-), (/), show, and, const)


import Plutus.Contract as Contract
    ( AsContractError,
      logError,
      logInfo,
      awaitTxConfirmed,
      endpoint,
      ownPubKeyHash,
      submitTxConstraintsWith,
      utxosAt,
      utxosTxOutTxAt,
      handleError,
      select,
      Contract,
      Promise(awaitPromise) )
import qualified PlutusTx
import PlutusTx.Prelude as Plutus
    ( return, Bool, Maybe(..), Eq((==)), (<$>), ($), Integer, (++), isJust, map )
import Ledger
    ( scriptAddress,
      pubKeyHash,
      getCardanoTxId,
      pubKeyHashAddress,
      CurrencySymbol,
      TokenName,
      ValidatorHash,
      Redeemer(Redeemer),
      Datum(Datum),
      TxOut(txOutValue),
      TxOutRef,
      ChainIndexTxOut, toTxOut )
import Ledger.Constraints as Constraints
    ( otherScript,
      typedValidatorLookups,
      unspentOutputs,
      mustPayToPubKey,
      mustPayToTheScript,
      mustSpendScriptOutput, mustPayToOtherScript )
import Ledger.Value as Value
    ( singleton,
      valueOf )
import qualified Plutus.V1.Ledger.Ada as Ada (lovelaceValueOf)
import Plutus.ChainIndex.Tx ( ChainIndexTx(_citxData) )

import           Market.Types               (MarketParams(..), NFTSale(..), SaleAction(..), SaleSchema, StartParams(..), BuyParams(..))
import           Market.Onchain             as O2 ( Sale, typedBuyValidator, buyValidator, buyValidatorHash, nftDatum )
import           Updator.Onchain            as O1 ( Updator, typedUpdateValidator, updateValidator )
import           Updator.Types              (UpdateVHash(..))
import           Utility                    (wallet, walletPubKeyHash, mp, mp')

sendToken :: Contract w SaleSchema Text ()
sendToken = do
    let val     = Value.singleton (updateCs mp) (updateTn mp) 1
        uvh     = UpdateVHash (O2.buyValidatorHash mp)
        lookups = Constraints.typedValidatorLookups (O1.typedUpdateValidator mp')
        tx      = Constraints.mustPayToTheScript uvh val
    ledgerTx <- submitTxConstraintsWith @O1.Updator lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
    Contract.logInfo @String "sent update token"

startSale :: StartParams -> Contract w SaleSchema Text ()
startSale sp = do
    pkh <- Contract.ownPubKeyHash
    utxos <- utxosAt (pubKeyHashAddress pkh)
    let val     = Value.singleton (sCs sp) (sTn sp) 1
        nfts    = NFTSale { nSeller = pkh, nToken = sTn sp, nCurrency = sCs sp, nPrice = sPrice sp, nRoyAddr = walletPubKeyHash $ wallet 5, nRoyPrct = 0 }
        lookups = Constraints.unspentOutputs utxos <>
                  Constraints.typedValidatorLookups (O2.typedBuyValidator mp)
        tx      = Constraints.mustPayToTheScript nfts val
    ledgerTx <- submitTxConstraintsWith @O2.Sale lookups tx
    void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
    Contract.logInfo @String "startSale transaction confirmed"


buy :: BuyParams -> Contract w SaleSchema Text ()
buy bp = do
    pkh <- Contract.ownPubKeyHash
    sale <- findSale (bCs bp, bTn bp)
    case sale of
        Nothing -> Contract.logError @String "No sale found"
        Just (oref, o, nfts) -> do
            let r       = Redeemer $ PlutusTx.toBuiltinData Buy
                val     = Value.singleton (nCurrency nfts) (nToken nfts) 1
                valAdaS = Ada.lovelaceValueOf (ceiling ((1 - 0.02 - (fromIntegral (nRoyPrct nfts) / 100)) Prelude.* fromIntegral (nPrice nfts) :: Float))
                valAdaF = Ada.lovelaceValueOf (ceiling (0.02 Prelude.* fromIntegral (nPrice nfts) :: Float))
            let lookups = Constraints.typedValidatorLookups (O2.typedBuyValidator mp) <>
                          Constraints.unspentOutputs (Map.singleton oref o)   <>
                          Constraints.otherScript (O2.buyValidator mp)
                tx      = Constraints.mustSpendScriptOutput oref r           <>
                          Constraints.mustPayToPubKey pkh val                <>
                          Constraints.mustPayToPubKey (nSeller nfts) valAdaS <>
                          Constraints.mustPayToPubKey (feeAddr mp) valAdaF
            if nRoyPrct nfts == 0 then do
                ledgerTx <- submitTxConstraintsWith lookups tx
                void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
                Contract.logInfo @String "buy transaction confirmed"
            else do
               let valRoy  = Ada.lovelaceValueOf (ceiling (fromIntegral (nRoyPrct nfts) / 100 Prelude.* fromIntegral (nPrice nfts) :: Float))
                   txFinal = Constraints.mustPayToPubKey (nRoyAddr nfts) valRoy <> tx
               ledgerTx <- submitTxConstraintsWith lookups txFinal
               void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
               Contract.logInfo @String "buy transaction confirmed"


buy' :: (BuyParams, BuyParams) -> Contract w SaleSchema Text ()
buy' (bp1, bp2) = do
    pkh <- Contract.ownPubKeyHash
    sale1 <- findSale (bCs bp1, bTn bp1)
    case sale1 of
        Nothing -> Contract.logError @String "No sale found"
        Just (oref, o, nfts) -> do
            sale2 <- findSale (bCs bp2, bTn bp2)
            case sale2 of
                Nothing -> Contract.logError @String "No sale found2"
                Just (oref', o', nfts') -> do
                    let r       = Redeemer $ PlutusTx.toBuiltinData Buy
                        val     = Value.singleton (nCurrency nfts) (nToken nfts) 1
                        val'    = Value.singleton (nCurrency nfts') (nToken nfts') 1
                        valAdaS = Ada.lovelaceValueOf (ceiling ((1 - 0.01 - (fromIntegral (nRoyPrct nfts) / 100)) Prelude.* fromIntegral (nPrice nfts) :: Float))
                        valAdaF = Ada.lovelaceValueOf (ceiling (0.01 Prelude.* fromIntegral (nPrice nfts) :: Float))
                    let lookups = Constraints.typedValidatorLookups (O2.typedBuyValidator mp) <>
                                  Constraints.unspentOutputs (Map.singleton oref o)   <>
                                  Constraints.unspentOutputs (Map.singleton oref' o')   <>
                                  Constraints.otherScript (O2.buyValidator mp)
                        tx      = Constraints.mustSpendScriptOutput oref r           <>
                                  Constraints.mustSpendScriptOutput oref' r          <>
                                  Constraints.mustPayToPubKey pkh val                <>
                                  Constraints.mustPayToPubKey pkh val'               <>
                                  Constraints.mustPayToPubKey (nSeller nfts) valAdaS <>
                                  Constraints.mustPayToPubKey (feeAddr mp) valAdaF
                    if nRoyPrct nfts == 0 then do
                        ledgerTx <- submitTxConstraintsWith lookups tx
                        void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
                        Contract.logInfo @String "buy transaction confirmed"
                    else do
                        let valRoy  = Ada.lovelaceValueOf (ceiling (fromIntegral (nRoyPrct nfts) / 100 Prelude.* fromIntegral (nPrice nfts) :: Float))
                            txFinal = Constraints.mustPayToPubKey (nRoyAddr nfts) valRoy <> tx
                        ledgerTx <- submitTxConstraintsWith lookups txFinal
                        void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
                        Contract.logInfo @String "buy transaction confirmed"


update :: (BuyParams, Integer) -> Contract w SaleSchema Text ()
update (bp, newprice) = do
    sale <- findSale (bCs bp, bTn bp)
    case sale of
        Nothing -> Contract.logError @String "No sale found"
        Just (oref, o, nfts) -> do
            let r       = Redeemer $ PlutusTx.toBuiltinData Update
                val     = Value.singleton (nCurrency nfts) (nToken nfts) 1
                nfts'   = nfts { nPrice = newprice }
                lookups = Constraints.typedValidatorLookups (O2.typedBuyValidator mp) <>
                          Constraints.otherScript (O2.buyValidator mp)                <>
                          Constraints.unspentOutputs (Map.singleton oref o)
                tx      = Constraints.mustSpendScriptOutput oref r <>
                          Constraints.mustPayToTheScript nfts' val
            ledgerTx <- submitTxConstraintsWith lookups tx
            void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
            Contract.logInfo @String "Price updated"


close :: BuyParams -> Contract w SaleSchema Text ()
close bp = do
    sale <- findSale (bCs bp, bTn bp)
    case sale of
        Nothing -> Contract.logError @String "No sale found"
        Just (oref, o, nfts) -> do
            let r       = Redeemer $ PlutusTx.toBuiltinData Close
                val     = Value.singleton (nCurrency nfts) (nToken nfts) 1 <> Ada.lovelaceValueOf 1724100
                lookups = Constraints.typedValidatorLookups (O2.typedBuyValidator mp) <>
                          Constraints.otherScript (O2.buyValidator mp)                <>
                          Constraints.unspentOutputs (Map.singleton oref o)
                tx      = Constraints.mustSpendScriptOutput oref r      <>
                          Constraints.mustPayToPubKey (nSeller nfts) val
            ledgerTx <- submitTxConstraintsWith lookups tx
            void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
            Contract.logInfo @String "close transaction confirmed"


findSale :: (AsContractError e, ToJSON e) => (CurrencySymbol, TokenName) -> Contract w SaleSchema e (Maybe (TxOutRef, ChainIndexTxOut, NFTSale))
findSale (cs, tn) = do
    utxos <- Map.filter f <$> utxosTxOutTxAt (scriptAddress $ O2.buyValidator mp)
    return $ case Map.toList utxos of
        [(oref, (o, citx))] -> do
            nfts <- nftDatum (toTxOut o) $ \dh -> Map.lookup dh $ _citxData citx
            Just (oref, o, nfts)
        _           -> Nothing

  where
    f :: (ChainIndexTxOut, Plutus.ChainIndex.Tx.ChainIndexTx) -> Bool
    f (o, _) = valueOf (txOutValue $ toTxOut o) cs tn == 1


updateContract :: ValidatorHash -> Contract w SaleSchema Text ()
updateContract vh = do
    datums <- findSales
    if and (map isJust datums) then do
        token <- findToken (updateCs mp, updateTn mp)
        case token of
            Nothing -> Contract.logError @String "update token not found"
            Just (oref, o) -> do
                let valToken = Value.singleton (updateCs mp) (updateTn mp) 1
                    uvh      = UpdateVHash vh
                    r        = Redeemer $ PlutusTx.toBuiltinData UpdateC
                    lookups  = Constraints.typedValidatorLookups (O1.typedUpdateValidator mp') <>
                               Constraints.otherScript (O1.updateValidator mp') <>
                               Constraints.otherScript (O2.buyValidator mp) <>
                               mconcat [ Constraints.unspentOutputs (Map.singleton oref' o') | Just (oref', o', _) <- datums ] <>
                               Constraints.unspentOutputs (Map.singleton oref o)
                    tx       = Constraints.mustSpendScriptOutput oref r <>
                               Constraints.mustPayToTheScript uvh valToken <>
                               mconcat [ Constraints.mustSpendScriptOutput oref' r | Just (oref', _, _) <- datums ] <>
                               mconcat [ Constraints.mustPayToOtherScript vh (Datum $ PlutusTx.toBuiltinData nfts) (Value.singleton (nCurrency nfts) (nToken nfts) 1) | Just (_, _, nfts) <- datums ]
                Contract.logInfo @String (show vh)
                ledgerTx <- submitTxConstraintsWith lookups tx
                void $ awaitTxConfirmed $ getCardanoTxId ledgerTx
                Contract.logInfo @String "Marketplace updated !"
    else Contract.logError @String "One of the sales has corrupted datum"


findToken :: (AsContractError e, ToJSON e) => (CurrencySymbol, TokenName) -> Contract w SaleSchema e (Maybe (TxOutRef, ChainIndexTxOut))
findToken (cs, tn) = do
    utxos <- Map.filter f <$> utxosTxOutTxAt (scriptAddress $ O1.updateValidator mp')
    return $ case Map.toList utxos of
        [(oref, (o, _))] -> Just (oref, o)
        _           -> Nothing
  where
    f :: (ChainIndexTxOut, Plutus.ChainIndex.Tx.ChainIndexTx) -> Bool
    f (o, _) = valueOf (txOutValue $ toTxOut o) cs tn == 1

findSales :: (AsContractError e, ToJSON e) => Contract w SaleSchema e [Maybe (TxOutRef, ChainIndexTxOut, NFTSale)]
findSales = do
    utxos <- utxosTxOutTxAt (scriptAddress $ O2.buyValidator mp)
    let mds = getDatums $ Map.toList utxos
    return mds

getDatums :: [(TxOutRef, (ChainIndexTxOut, ChainIndexTx))] -> [Maybe (TxOutRef, ChainIndexTxOut, NFTSale)]
getDatums [] = []
getDatums [(oref, (o, citx))] = do
    let dat = nftDatum (toTxOut o) $ \dh -> Map.lookup dh $ _citxData citx
    case dat of
        Just nfts -> [Just (oref, o, nfts)]
        _         -> [Nothing]
getDatums (x:xs) = getDatums [x] ++ getDatums xs

endpoints :: Contract () SaleSchema Text ()
endpoints = forever
          $ handleError logError
          $ awaitPromise
          $ start' `select` buy1
                   `select` buy2
                   `select` close'
                   `select` update'
                   `select` updateContract'
                   `select` sendToken'
  where
    start'          = endpoint @"start"          $ \nfts       -> startSale nfts
    buy1            = endpoint @"buy"            $ \bp         -> buy bp
    buy2            = endpoint @"buy'"           $ \(bp1, bp2) -> buy' (bp1, bp2)
    close'          = endpoint @"close"          $ \nfts       -> close nfts
    update'         = endpoint @"update"         $ \(nfts, x)  -> update (nfts, x)
    updateContract' = endpoint @"updateContract" $ \vh         -> updateContract vh
    sendToken'      = endpoint @"sendToken"      $ const         sendToken