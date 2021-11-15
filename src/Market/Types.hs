{-# LANGUAGE DeriveAnyClass        #-}
{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE ScopedTypeVariables   #-}
{-# LANGUAGE TemplateHaskell       #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE TypeOperators         #-}

module Market.Types
    ( MartDatum (..)
    , SaleAction (..)
    , SaleSchema
    , StartParams (..)
    , BuyParams (..)
    , NFTSale (..)
    , UpdateVHash (..)
    , MarketParams (..)
    )
    where

import           Data.Aeson                (ToJSON, FromJSON)
import           GHC.Generics              (Generic)
import           Prelude                   (Show (..))
import qualified Prelude                   as Pr

import           Schema                    (ToSchema)
import qualified PlutusTx
import           PlutusTx.Prelude          as Plutus ( Eq(..), (&&), Integer )
import           Ledger                    ( TokenName, CurrencySymbol, PubKeyHash, ValidatorHash )
import           Plutus.Contract           ( Endpoint, type (.\/) )

data MarketParams = MarketParams
    { feeAddr  :: PubKeyHash
    , updateTn :: TokenName
    , updateCs :: CurrencySymbol
    } deriving (Pr.Eq, Pr.Ord, Show, Generic, ToJSON, FromJSON, ToSchema)

PlutusTx.makeIsDataIndexed ''MarketParams [('MarketParams, 0)]
PlutusTx.makeLift ''MarketParams

data NFTSale = NFTSale
    { nSeller    :: !PubKeyHash
    , nPrice     :: !Plutus.Integer
    , nCurrency  :: !CurrencySymbol
    , nToken     :: !TokenName
    , nRoyAddr   :: !PubKeyHash
    , nRoyPrct   :: !Plutus.Integer
    } deriving (Pr.Eq, Pr.Ord, Show, Generic, ToJSON, FromJSON, ToSchema)

instance Eq NFTSale where
    {-# INLINABLE (==) #-}
    a == b = (nSeller    a == nSeller    b) &&
             (nPrice     a == nPrice     b) &&
             (nCurrency  a == nCurrency  b) &&
             (nToken     a == nToken     b) &&
             (nRoyAddr   a == nRoyAddr   b) &&
             (nRoyPrct   a == nRoyPrct   b)

PlutusTx.makeIsDataIndexed ''NFTSale [('NFTSale, 0)]
PlutusTx.makeLift ''NFTSale


newtype UpdateVHash = UpdateVHash
    { vhash :: ValidatorHash
    } deriving (Pr.Eq, Pr.Ord, Show, Generic, ToJSON, FromJSON, ToSchema)

instance Eq UpdateVHash where
    {-# INLINABLE (==) #-}
    a == b = vhash a == vhash b

PlutusTx.makeIsDataIndexed ''UpdateVHash [('UpdateVHash, 0)]
PlutusTx.makeLift ''UpdateVHash


data MartDatum = UpdateToken UpdateVHash | SaleData NFTSale
    deriving (Show)

PlutusTx.makeIsDataIndexed ''MartDatum [('UpdateToken, 0), ('SaleData, 1)]
PlutusTx.makeLift ''MartDatum

data SaleAction = Buy | Update | Close | UpdateC
    deriving Show

PlutusTx.makeIsDataIndexed ''SaleAction [('Buy, 0), ('Update, 1), ('Close, 2), ('UpdateC, 3)]
PlutusTx.makeLift ''SaleAction


-- We define two different params for the two endpoints start and buy with the minimal info needed.
-- Therefore the user doesn't have to provide more that what's needed to execute the said action.
{- For StartParams we ommit the seller
    because we automatically input the address of the wallet running the startSale enpoint
    
   For BuyParams we ommit seller and price
    because we can read that in datum which can be obtained with just cs and tn of the sold token -}

data BuyParams = BuyParams
    { bCs :: CurrencySymbol
    , bTn :: TokenName
    } deriving (Pr.Eq, Pr.Ord, Show, Generic, ToJSON, FromJSON, ToSchema)


data StartParams = StartParams
    { sPrice :: Integer
    , sCs    :: CurrencySymbol
    , sTn    :: TokenName
    } deriving (Pr.Eq, Pr.Ord, Show, Generic, ToJSON, FromJSON, ToSchema)


type SaleSchema = Endpoint "close" BuyParams
                  .\/
                  Endpoint "buy" BuyParams
                  .\/
                  Endpoint "update" (BuyParams, Integer)
                  .\/
                  Endpoint "start" StartParams
                  .\/
                  Endpoint "updateContract" ValidatorHash
                  .\/
                  Endpoint "sendToken" Integer