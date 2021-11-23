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
    , tokenDatum
    ) where

import qualified Data.ByteString.Lazy     as LB
import qualified Data.ByteString.Short    as SBS
import           Codec.Serialise          ( serialise )

import           Cardano.Api.Shelley      (PlutusScript (..), PlutusScriptV1)
import qualified PlutusTx
import PlutusTx.Prelude as Plutus
    ( Bool(..), Eq((==)), (.), (&&), traceIfFalse, Maybe(..), length )
import Ledger
    ( TokenName,
      ValidatorHash,
      CurrencySymbol,
      DatumHash,
      Datum(..),
      txOutDatum,
      txSignedBy,
      ScriptContext(scriptContextTxInfo),
      Validator,
      TxOut,
      unValidatorScript,
      txOutValue,
      getContinuingOutputs, validatorHash)
import qualified Ledger.Typed.Scripts      as Scripts
import qualified Plutus.V1.Ledger.Scripts as Plutus
import           Ledger.Value              as Value ( valueOf )

import           Market.Types               (MarketParams(..), UpdateVHash(..))

{-# INLINABLE tokenDatum #-}
tokenDatum :: TxOut -> (DatumHash -> Maybe Datum) -> Maybe UpdateVHash
tokenDatum o f = do
    dh <- txOutDatum o
    Datum d <- f dh
    PlutusTx.fromBuiltinData d

{-# INLINABLE mkBuyValidator #-}
mkBuyValidator :: MarketParams -> UpdateVHash -> PlutusTx.BuiltinData -> ScriptContext -> Bool
mkBuyValidator mp _ _ ctx =
    traceIfFalse "Permission denied" (txSignedBy (scriptContextTxInfo ctx) (feeAddr mp))   &&
    traceIfFalse "Update Token not returned" (checkContinuing (updateCs mp) (updateTn mp))
  where
    checkContinuing :: CurrencySymbol -> TokenName -> Bool
    checkContinuing cs tn = let cos = [ co | co <- getContinuingOutputs ctx, valueOf (txOutValue co) cs tn == 1 ] in
        length cos == 1

    


data Sale
instance Scripts.ValidatorTypes Sale where
    type instance DatumType Sale    = UpdateVHash
    type instance RedeemerType Sale = PlutusTx.BuiltinData


typedBuyValidator :: MarketParams -> Scripts.TypedValidator Sale
typedBuyValidator mp = Scripts.mkTypedValidator @Sale
    ($$(PlutusTx.compile [|| mkBuyValidator ||]) `PlutusTx.applyCode` PlutusTx.liftCode mp)
    $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @UpdateVHash @PlutusTx.BuiltinData


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
