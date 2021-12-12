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
companyPkhReal = "74125b187d91d0495e14648ac24bf7b470c7d400ce0a8a29a99bb4c4"

uCsReal :: CurrencySymbol
uCsReal = "1bee72f6551a6f0cccc67d05c4b8652755160f2d35a5f6d64f3c75b8"

uTnReal :: TokenName
uTnReal = "UpdateToken"

mpReal :: MarketParams
mpReal = MarketParams companyPkhReal uTnReal uCsReal