const errorTypes = {
  COULD_NOT_FETCH_ASSET_DETAILS: "COULD_NOT_FETCH_ASSET_DETAILS",
  COULD_NOT_FETCH_ASSET_TRANSACTIONS: "COULD_NOT_FETCH_ASSET_TRANSACTIONS",
  COULD_NOT_FETCH_ADDRESS_UTXOS: "COULD_NOT_FETCH_ADDRESS_UTXOS",
  COULD_NOT_FETCH_ASSET_UTXOS: "COULD_NOT_FETCH_ASSET_UTXOS",
  COULD_NOT_FETCH_MINTED_ASSETS: "COULD_NOT_FETCH_MINTED_ASSETS",
  COULD_NOT_FETCH_TRANSACTION_METADATA: "COULD_NOT_FETCH_TRANSACTION_METADATA",
  COULD_NOT_FETCH_TRANSACTION_UTXOS: "COULD_NOT_FETCH_TRANSACTION_UTXOS",
  COULD_NOT_FETCH_PROTOCOL_PARAMETERS: "COULD_NOT_FETCH_PROTOCOL_PARAMETERS",

  COULD_NOT_ADD_OFFER_FOR_THE_ASSET: "Could not add offer for the asset.",

  COULD_NOT_PURCHASE_TOKEN: "Could not purchase asset.", 

  // Database Errors - Asset
  COULD_NOT_RETRIEVE_ASSET_FROM_DB: "Could not retrieve asset from database.",
  COULD_NOT_RETRIEVE_ASSETS_FROM_DB: "Could not retrieve assets from database.",
  COULD_NOT_RETRIEVE_COLLECTION_ASSETS_FROM_DB: "Could not retrieve collection assets from database.",
  COULD_NOT_RETRIEVE_LOCKED_ASSETS_FROM_DB: "Could not retrieve locked assets from database.",
  COULD_NOT_SAVE_ASSET_TO_DB: "Could not save asset to database.",
  // Database Errors - Wallet
  COULD_NOT_RETRIEVE_WALLET_FROM_DB: "Could not retrieve wallet from database.",
  COULD_NOT_SAVE_WALLET_TO_DB: "Could not save wallet to database.",
};

export default errorTypes;
