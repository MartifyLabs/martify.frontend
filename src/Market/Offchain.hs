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
      ownPubKey,
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
      txId,
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

import           Market.Types               (MartDatum(..), MarketParams(..), UpdateVHash(..), NFTSale(..), SaleAction(..), SaleSchema, StartParams(..), BuyParams(..))
import           Market.Onchain             ( Sale, typedBuyValidator, buyValidator, buyValidatorHash,nftDatum )
import           Utility                    (wallet, walletPubKeyHash, mp)

sendToken :: Contract w SaleSchema Text ()
sendToken = do
    let val     =  Value.singleton (updateCs mp) (updateTn mp) 1
        uvh     = UpdateVHash (buyValidatorHash mp)
        dat     = UpdateToken uvh
        lookups = Constraints.typedValidatorLookups (typedBuyValidator mp)
        tx      = Constraints.mustPayToTheScript dat val
    Contract.logInfo @String (show (buyValidatorHash mp))
    ledgerTx <- submitTxConstraintsWith @Sale lookups tx
    void $ awaitTxConfirmed $ txId ledgerTx
    Contract.logInfo @String "sent update token"

startSale :: StartParams -> Contract w SaleSchema Text ()
startSale sp = do
    pkh <- pubKeyHash <$> Contract.ownPubKey
    utxos <- utxosAt (pubKeyHashAddress pkh)
    let val     = Value.singleton (sCs sp) (sTn sp) 1
        nfts    = NFTSale { nSeller = pkh, nToken = sTn sp, nCurrency = sCs sp, nPrice = sPrice sp, nRoyAddr = walletPubKeyHash $ wallet 5, nRoyPrct = 3 }
        dat     = SaleData nfts
        lookups = Constraints.unspentOutputs utxos <>
                  Constraints.typedValidatorLookups (typedBuyValidator mp)
        tx      = Constraints.mustPayToTheScript dat val
    ledgerTx <- submitTxConstraintsWith @Sale lookups tx
    void $ awaitTxConfirmed $ txId ledgerTx
    Contract.logInfo @String "startSale transaction confirmed"


buy :: BuyParams -> Contract w SaleSchema Text ()
buy bp = do
    pkh <- pubKeyHash <$> Contract.ownPubKey
    sale <- findSale (bCs bp, bTn bp)
    case sale of
        Nothing -> Contract.logError @String "No sale found"
        Just (oref, o, nfts) -> do
            let r       = Redeemer $ PlutusTx.toBuiltinData Buy
                val     = Value.singleton (nCurrency nfts) (nToken nfts) 1
                valAdaS = Ada.lovelaceValueOf (ceiling ((1 - 0.02 - (fromIntegral (nRoyPrct nfts) / 100)) Prelude.* fromIntegral (nPrice nfts) :: Float))
                valAdaF = Ada.lovelaceValueOf (ceiling (0.02 Prelude.* fromIntegral (nPrice nfts) :: Float))
            let lookups = Constraints.typedValidatorLookups (typedBuyValidator mp) <>
                          Constraints.unspentOutputs (Map.singleton oref o)   <>
                          Constraints.otherScript (buyValidator mp)
                tx      = Constraints.mustSpendScriptOutput oref r           <>
                          Constraints.mustPayToPubKey pkh val                <>
                          Constraints.mustPayToPubKey (nSeller nfts) valAdaS <>
                          Constraints.mustPayToPubKey (feeAddr mp) valAdaF
            if nRoyPrct nfts == 0 then do
                ledgerTx <- submitTxConstraintsWith lookups tx
                void $ awaitTxConfirmed $ txId ledgerTx
                Contract.logInfo @String "buy transaction confirmed"
            else do
               let valRoy  = Ada.lovelaceValueOf (ceiling (fromIntegral (nRoyPrct nfts) / 100 Prelude.* fromIntegral (nPrice nfts) :: Float))
                   txFinal = Constraints.mustPayToPubKey (nRoyAddr nfts) valRoy <> tx
               ledgerTx <- submitTxConstraintsWith lookups txFinal
               void $ awaitTxConfirmed $ txId ledgerTx
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
                dat     = SaleData nfts'
                lookups = Constraints.typedValidatorLookups (typedBuyValidator mp) <>
                          Constraints.otherScript (buyValidator mp)                <>
                          Constraints.unspentOutputs (Map.singleton oref o)
                tx      = Constraints.mustSpendScriptOutput oref r <>
                          Constraints.mustPayToTheScript dat val
            ledgerTx <- submitTxConstraintsWith lookups tx
            void $ awaitTxConfirmed $ txId ledgerTx
            Contract.logInfo @String "Price updated"


close :: BuyParams -> Contract w SaleSchema Text ()
close bp = do
    sale <- findSale (bCs bp, bTn bp)
    case sale of
        Nothing -> Contract.logError @String "No sale found"
        Just (oref, o, nfts) -> do
            let r       = Redeemer $ PlutusTx.toBuiltinData Close
                val     = Value.singleton (nCurrency nfts) (nToken nfts) 1 <> Ada.lovelaceValueOf 1724100
                lookups = Constraints.typedValidatorLookups (typedBuyValidator mp) <>
                          Constraints.otherScript (buyValidator mp)                <>
                          Constraints.unspentOutputs (Map.singleton oref o)
                tx      = Constraints.mustSpendScriptOutput oref r      <>
                          Constraints.mustPayToPubKey (nSeller nfts) val
            ledgerTx <- submitTxConstraintsWith lookups tx
            void $ awaitTxConfirmed $ txId ledgerTx
            Contract.logInfo @String "close transaction confirmed"


findSale :: (AsContractError e, ToJSON e) => (CurrencySymbol, TokenName) -> Contract w SaleSchema e (Maybe (TxOutRef, ChainIndexTxOut, NFTSale))
findSale (cs, tn) = do
    utxos <- Map.filter f <$> utxosTxOutTxAt (scriptAddress $ buyValidator mp)
    return $ case Map.toList utxos of
        [(oref, (o, citx))] -> do
            md <- nftDatum (toTxOut o) $ \dh -> Map.lookup dh $ _citxData citx
            case md of
                SaleData nfts ->
                    Just (oref, o, nfts)
                _ -> Nothing
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
                    md       = UpdateToken $ UpdateVHash vh
                    dat      = Datum $ PlutusTx.toBuiltinData md
                    r        = Redeemer $ PlutusTx.toBuiltinData UpdateC
                    lookups  = Constraints.typedValidatorLookups (typedBuyValidator mp) <>
                               Constraints.otherScript (buyValidator mp) <>
                               mconcat [ Constraints.unspentOutputs (Map.singleton oref' o') | Just (oref', o', _) <- datums ] <>
                               Constraints.unspentOutputs (Map.singleton oref o)
                    tx       = Constraints.mustSpendScriptOutput oref r <>
                               Constraints.mustPayToOtherScript vh dat valToken <>
                               mconcat [ Constraints.mustSpendScriptOutput oref' r | Just (oref', _, _) <- datums ] <>
                               mconcat [ Constraints.mustPayToOtherScript vh (Datum $ PlutusTx.toBuiltinData $ SaleData nfts) (Value.singleton (nCurrency nfts) (nToken nfts) 1) | Just (_, _, nfts) <- datums ]
                Contract.logInfo @String (show vh)
                ledgerTx <- submitTxConstraintsWith lookups tx
                void $ awaitTxConfirmed $ txId ledgerTx
                Contract.logInfo @String "Marketplace updated !"
    else Contract.logError @String "One of the sales has corrupted datum"


findToken :: (AsContractError e, ToJSON e) => (CurrencySymbol, TokenName) -> Contract w SaleSchema e (Maybe (TxOutRef, ChainIndexTxOut))
findToken (cs, tn) = do
    utxos <- Map.filter f <$> utxosTxOutTxAt (scriptAddress $ buyValidator mp)
    return $ case Map.toList utxos of
        [(oref, (o, _))] -> Just (oref, o)
        _           -> Nothing
  where
    f :: (ChainIndexTxOut, Plutus.ChainIndex.Tx.ChainIndexTx) -> Bool
    f (o, _) = valueOf (txOutValue $ toTxOut o) cs tn == 1

findSales :: (AsContractError e, ToJSON e) => Contract w SaleSchema e [Maybe (TxOutRef, ChainIndexTxOut, NFTSale)]
findSales = do
    utxos <- Map.filter f <$> utxosTxOutTxAt (scriptAddress $ buyValidator mp)
    let mds = getDatums $ Map.toList utxos
    return mds
  where
    f :: (ChainIndexTxOut, Plutus.ChainIndex.Tx.ChainIndexTx) -> Bool
    f (o, _) = valueOf (txOutValue $ toTxOut o) (updateCs mp) (updateTn mp) == 0

getDatums :: [(TxOutRef, (ChainIndexTxOut, ChainIndexTx))] -> [Maybe (TxOutRef, ChainIndexTxOut, NFTSale)]
getDatums [] = []
getDatums [(oref, (o, citx))] = do
    let md = nftDatum (toTxOut o) $ \dh -> Map.lookup dh $ _citxData citx
    case md of
        Just (SaleData nfts) -> [Just (oref, o, nfts)]
        _ -> [Nothing]
getDatums (x:xs) = getDatums [x] ++ getDatums xs

endpoints :: Contract () SaleSchema Text ()
endpoints = forever
          $ handleError logError
          $ awaitPromise
          $ start' `select` buy'
                   `select` close'
                   `select` update'
                   `select` updateContract'
                   `select` sendToken'
  where
    start'          = endpoint @"start"          $ \nfts      -> startSale nfts
    buy'            = endpoint @"buy"            $ \nfts      -> buy nfts
    close'          = endpoint @"close"          $ \nfts      -> close nfts
    update'         = endpoint @"update"         $ \(nfts, x) -> update (nfts, x)
    updateContract' = endpoint @"updateContract" $ \vh        -> updateContract vh
    sendToken'      = endpoint @"sendToken"      $ const         sendToken