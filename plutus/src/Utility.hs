{-# LANGUAGE OverloadedStrings #-}

module Utility
    ( walletPubKeyHash
    , wallet
    , companyPkh
    , companyPkhReal
    , mp
    , mpReal ) where

import           Plutus.V1.Ledger.Crypto (PubKeyHash)
import           Ledger (pubKeyHash, TokenName, CurrencySymbol)
import           Wallet.Emulator.Wallet (Wallet, walletPubKey, fromWalletNumber, WalletNumber(..))
import           PlutusTx.Prelude ((.))

import           Prelude hiding ((.))

import Market.Types (MarketParams(..))

wallet :: Integer -> Wallet
wallet = fromWalletNumber . WalletNumber

walletPubKeyHash :: Wallet -> PubKeyHash
walletPubKeyHash = pubKeyHash . walletPubKey

companyPkh :: PubKeyHash
companyPkh = walletPubKeyHash $ wallet 1

uTn :: TokenName
uTn = "UpdateToken"

uCs :: CurrencySymbol
uCs = "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b"

mp :: MarketParams
mp = MarketParams companyPkh uTn uCs

companyPkhReal :: PubKeyHash
companyPkhReal = "a75c75fa79bc7d53ef715d64745a7a01c2c1f7653b2ae962413ac521"

uCsReal :: CurrencySymbol
uCsReal = "5401349896e3b61af27237b2d739cdd142b76fb984174529fc9c3f5e"

uTnReal :: TokenName
uTnReal = "UpdateToken"

mpReal :: MarketParams
mpReal = MarketParams companyPkhReal uTnReal uCsReal