import Cardano from "../cardano/serialization-lib";
import { toHex, toLovelace } from "./converter";

export const createDatum = (
  tokenName,
  currencySymbol,
  sellerAddress,
  royaltiesAddress,
  royaltiesPercentage,
  price
) => {
  if (
    tokenName &&
    currencySymbol &&
    sellerAddress &&
    royaltiesAddress &&
    royaltiesPercentage !== undefined &&
    price
  ) {
    return {
      tn: tokenName,
      cs: currencySymbol,
      sa: getAddressKeyHash(sellerAddress),
      ra: getAddressKeyHash(royaltiesAddress),
      rp: royaltiesPercentage ? royaltiesPercentage : 0,
      price: toLovelace(price),
    };
  }
};

/**
 * @param {string} byWallet - a wallet address needs to be in bech32 format.
 */
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

/**
 * @param {string} byWallet - a wallet address needs to be in bech32 format.
 */
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

const getAddressKeyHash = (address) => {
  return toHex(
    Cardano.Instance.BaseAddress.from_address(
      Cardano.Instance.Address.from_bech32(address)
    )
      .payment_cred()
      .to_keyhash()
      .to_bytes()
  );
};
