export const createEvent = (action, datum, txHash, byWallet) => {
  if (action && datum && txHash && byWallet) {
    return {
      action,
      datum,
      txHash,
      submittedBy: byWallet,
      submittedOn: new Date().getTime(),
    };
  }
};

export const createOffer = (byWallet, forAsset, value) => {
  if (byWallet && forAsset && value) {
    return {
      by: byWallet,
      for: forAsset,
      on: new Date().getTime(),
      value,
    };
  }
};
