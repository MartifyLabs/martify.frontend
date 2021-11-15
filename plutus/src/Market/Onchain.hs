{-# LANGUAGE DataKinds                  #-}
{-# LANGUAGE NoImplicitPrelude          #-}
{-# LANGUAGE OverloadedStrings          #-}
{-# LANGUAGE TemplateHaskell            #-}
{-# LANGUAGE TypeApplications           #-}
{-# LANGUAGE TypeFamilies               #-}
{-# LANGUAGE DerivingStrategies         #-}

module Market.Onchain
    ( apiBuyScript
    , buyScriptAsShortBs
    , typedBuyValidator
    , Sale
    , buyValidator
    , buyValidatorHash
    , nftDatum
    ) where

import qualified Data.ByteString.Lazy     as LB
import qualified Data.ByteString.Short    as SBS
import           Codec.Serialise          ( serialise )

import           Cardano.Api.Shelley      (PlutusScript (..), PlutusScriptV1)
import qualified PlutusTx
import PlutusTx.Prelude as Plutus
    ( Bool(..), map, Eq((==)), (.), (&&), traceIfFalse, Integer, Maybe(..), (>=), fromInteger, (*), (%), (-), ($) )
import Ledger
    ( TokenName,
      PubKeyHash(..),
      Address(Address),
      ValidatorHash,
      CurrencySymbol,
      DatumHash,
      Datum(..),
      txOutDatum,
      txSignedBy,
      ScriptContext(scriptContextTxInfo),
      TxInfo,
      Validator,
      TxOut,
      txInfoSignatories,
      unValidatorScript,
      valuePaidTo,
      findDatum,
      txInfoOutputs,
      txOutValue,
      txOutAddress,
      txInInfoResolved,
      txInfoInputs,
      getContinuingOutputs, validatorHash)
import qualified Ledger.Typed.Scripts      as Scripts
import qualified Plutus.V1.Ledger.Scripts as Plutus
import           Ledger.Value              as Value ( valueOf )
import qualified Plutus.V1.Ledger.Ada as Ada (fromValue, Ada (getLovelace))
import           Plutus.V1.Ledger.Credential (Credential(ScriptCredential))

import           Market.Types               (NFTSale(..), MarketParams(..), MartDatum(..), UpdateVHash(..), SaleAction(..))


{-# INLINABLE nftDatum #-}
nftDatum :: TxOut -> (DatumHash -> Maybe Datum) -> Maybe MartDatum
nftDatum o f = do
    dh <- txOutDatum o
    Datum d <- f dh
    PlutusTx.fromBuiltinData d

{-# INLINABLE mkBuyValidator #-}
mkBuyValidator :: MarketParams -> MartDatum -> SaleAction -> ScriptContext -> Bool
mkBuyValidator mp md r ctx =
    case md of
        SaleData nfts ->
            case r of
                Buy     -> traceIfFalse "Fee not paid" (checkFee $ nPrice nfts) &&
                           traceIfFalse "NFT not sent to buyer" (checkNFTOut (nCurrency nfts) (nToken nfts)) &&
                           if nRoyPrct nfts == 0
                               then traceIfFalse "Seller not paid" (checkSellerOut (nSeller nfts) (nPrice nfts))
                               else traceIfFalse "Seller' not paid" (checkSellerOut' (nSeller nfts) (nRoyPrct nfts) (nPrice nfts)) &&
                                    traceIfFalse "Royalty not paid" (checkRoyalty (nRoyAddr nfts) (nRoyPrct nfts) (nPrice nfts))
                Update  -> traceIfFalse "No rights to perform this action" (checkUser $ nSeller nfts) &&
                           traceIfFalse "Modified datum other than price" (checkDatum nfts) &&
                           traceIfFalse "NFT left the script" (checkContinuingNFT (nCurrency nfts) (nToken nfts))
                Close   -> traceIfFalse "No rights to perform this action" (checkUser $ nSeller nfts) &&
                           traceIfFalse "Close output invalid" (checkCloseOut (nCurrency nfts) (nToken nfts) (nSeller nfts))
                UpdateC -> traceIfFalse "No UpdateToken in inputs" checkInputUpdate &&
                           traceIfFalse "Datum Changed" (checkDatumUpdate nfts)     &&
                           traceIfFalse "NFT not going to new validator" (checkUpdate (nCurrency nfts) (nToken nfts))

        UpdateToken uvh ->
            traceIfFalse "Permission denied" (txSignedBy (scriptContextTxInfo ctx) (feeAddr mp)) &&
            case r of
                UpdateC -> 
                    traceIfFalse "Token not going to new validator" (checkUpdate (updateCs mp) (updateTn mp)) &&
                    traceIfFalse "Update Token Datum Changed" (checkTokenDatum uvh)
                _       ->
                    traceIfFalse "Update Token not returned" checkContinuingToken
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx


    sig :: PubKeyHash
    sig = case txInfoSignatories info of
            [pubKeyHash] -> pubKeyHash


    getTokenDatum :: Maybe MartDatum
    getTokenDatum = let is = [ i | i <- map txInInfoResolved (txInfoInputs info), valueOf (txOutValue i) (updateCs mp) (updateTn mp) == 1 ] in
                    case is of
                        [i] -> nftDatum i (`findDatum` info)
                        _   -> Nothing

    getSaleDatum :: CurrencySymbol -> TokenName -> Maybe MartDatum
    getSaleDatum cs tn = let os = [ o | o <- txInfoOutputs info, valueOf (txOutValue o) cs tn == 1 ] in
                  case os of
                    [o] -> nftDatum o (`findDatum` info)
                    _   -> Nothing

    checkNFTOut :: CurrencySymbol -> TokenName -> Bool
    checkNFTOut cs tn = valueOf (valuePaidTo info sig) cs tn == 1

    checkSellerOut :: PubKeyHash -> Integer -> Bool
    checkSellerOut seller price = fromInteger (Ada.getLovelace (Ada.fromValue (valuePaidTo info seller))) >= (100 - 2) % 100 * fromInteger price

    checkSellerOut' :: PubKeyHash -> Integer -> Integer -> Bool
    checkSellerOut' seller royPrct price = fromInteger (Ada.getLovelace (Ada.fromValue (valuePaidTo info seller))) >= (100 - 2 - royPrct) % 100 * fromInteger price

    checkFee :: Integer -> Bool
    checkFee price = fromInteger (Ada.getLovelace (Ada.fromValue (valuePaidTo info (feeAddr mp)))) >= 2 % 100 * fromInteger price

    checkRoyalty :: PubKeyHash -> Integer -> Integer -> Bool
    checkRoyalty royAddr royPrct price = fromInteger (Ada.getLovelace (Ada.fromValue (valuePaidTo info royAddr))) >= royPrct % 100 * fromInteger price

    checkUser :: PubKeyHash -> Bool
    checkUser seller = txSignedBy info seller

    checkDatum :: NFTSale -> Bool
    checkDatum nfts = case getSaleDatum (nCurrency nfts) (nToken nfts) of
      Just (SaleData ns) -> nSeller   ns == nSeller   nfts &&
                            nCurrency ns == nCurrency nfts &&
                            nToken    ns == nToken    nfts &&
                            nRoyAddr  ns == nRoyAddr  nfts &&
                            nRoyPrct  ns == nRoyPrct  nfts
      _                  -> False

    checkContinuingNFT :: CurrencySymbol -> TokenName -> Bool
    checkContinuingNFT cs tn = let cos = [ co | co <- getContinuingOutputs ctx, valueOf (txOutValue co) cs tn == 1 ] in
        case cos of
            [_] -> True
            _   -> False

    checkCloseOut :: CurrencySymbol -> TokenName -> PubKeyHash -> Bool
    checkCloseOut cs tn seller = valueOf (valuePaidTo info seller) cs tn == 1

    checkInputUpdate :: Bool
    checkInputUpdate = let is = [ i | i <- map txInInfoResolved (txInfoInputs info), valueOf (txOutValue i) (updateCs mp) (updateTn mp) == 1 ] in
        case is of
            [_] -> True
            _   -> False

    checkDatumUpdate :: NFTSale -> Bool
    checkDatumUpdate nfts = case getSaleDatum (nCurrency nfts) (nToken nfts) of
        Just (SaleData ns) -> ns == nfts
        _                  -> False

    checkTokenDatum :: UpdateVHash -> Bool
    checkTokenDatum uvh = case getSaleDatum (updateCs mp) (updateTn mp) of
        Just (UpdateToken uvhash) -> uvhash == uvh
        _                         -> False

    checkContinuingToken :: Bool
    checkContinuingToken = let os = [ o | o <- getContinuingOutputs ctx, valueOf (txOutValue o) (updateCs mp) (updateTn mp) == 1 ] in
        case os of
            [_] -> True
            _   -> False

    checkUpdate :: CurrencySymbol -> TokenName -> Bool
    checkUpdate cs tn = case getTokenDatum of
        Just (UpdateToken uvh) -> let
            addrv2 = Address (ScriptCredential (vhash uvh)) Nothing
            os = [ o | o <- txInfoOutputs info, txOutAddress o == addrv2 && valueOf (txOutValue o) cs tn == 1 ] in
                case os of
                    [_] -> True
                    _   -> False
        _                      -> False



data Sale
instance Scripts.ValidatorTypes Sale where
    type instance DatumType Sale    = MartDatum
    type instance RedeemerType Sale = SaleAction


typedBuyValidator :: MarketParams -> Scripts.TypedValidator Sale
typedBuyValidator mp = Scripts.mkTypedValidator @Sale
    ($$(PlutusTx.compile [|| mkBuyValidator ||]) `PlutusTx.applyCode` PlutusTx.liftCode mp)
    $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @MartDatum @SaleAction


buyValidator :: MarketParams -> Validator
buyValidator = Scripts.validatorScript . typedBuyValidator

buyValidatorHash :: MarketParams -> ValidatorHash
buyValidatorHash = validatorHash . buyValidator

buyScript :: MarketParams -> Plutus.Script
buyScript = Ledger.unValidatorScript . buyValidator

buyScriptAsShortBs :: MarketParams -> SBS.ShortByteString
buyScriptAsShortBs = SBS.toShort . LB.toStrict . serialise . buyScript

apiBuyScript :: MarketParams -> PlutusScript PlutusScriptV1
apiBuyScript = PlutusScriptSerialised . buyScriptAsShortBs
