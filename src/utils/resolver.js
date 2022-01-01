export const resolveError = (errorType, eventName) => {
  switch (errorType) {
    case "COULD_NOT_RETRIEVE_ASSET_FROM_DB":
    case "COULD_NOT_RETRIEVE_COLLECTION_ASSETS_FROM_DB":
    case "COULD_NOT_RETRIEVE_LOCKED_ASSETS_FROM_DB":
      return `An error occurred during ${eventName}. Asset details couldn't be retrieved.`;

    case "COULD_NOT_SAVE_ASSET_TO_DB":
      return `An error occurred during ${eventName}. Asset details couldn't be saved.`;

    case "COULD_NOT_RETRIEVE_WALLET_FROM_DB":
      return `An error occurred during ${eventName}. Account details couldn't be retrieved.`;

    case "COULD_NOT_SAVE_WALLET_TO_DB":
      return `An error occurred during ${eventName}. Account details couldn't be saved.`;

    case "TRANSACTION_FAILED_SO_MANY_UTXOS":
      return `An error occurred during ${eventName}. So many UTXOs [Please try again].`;

    case "TRANSACTION_FAILED_NOT_ENOUGH_FUNDS":
      return `An error occurred during ${eventName}. Not enough funds.`;

    case "TRANSACTION_FAILED_CHANGE_TOO_SMALL":
      return `An error occurred during ${eventName}. Change too small [Please try again].`;

    case "TRANSACTION_FAILED_MAX_TX_SIZE_REACHED":
      return `An error occurred during ${eventName}. Max transaction size reached [Please try again].`;

    case "TRANSACTION_FAILED_DATUMS_NOT_MATCHING":
    case "TRANSACTION_FAILED_WRONG_SCRIPT_CONTRACT":
      return `An error occurred during ${eventName}. Transaction details are corrupted [Please Contact Us].`;

    case "TRANSACTION_FAILED_ASSET_NOT_SPENDABLE":
      return `An error occurred during ${eventName}. Please try again later.`;

    case "TRANSACTION_FAILED":
      return `An error occurred during ${eventName}. The transaction could not be submitted [Please try again].`;
    
    case "TRANSACTION_NOT_CONFIRMED":
      return `Transaction not fully confirmed yet. Please try again later.`;

    default:
      return `An error occurred during ${eventName}. Please try again later.`;
  }
};
