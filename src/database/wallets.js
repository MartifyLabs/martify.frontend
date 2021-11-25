import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const getWallet = async (address) => {
  try {
    if (address) {
      const reference = doc(firestore, "wallets", address);
      const snapshot = await getDoc(reference);
      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        const wallet = {
          address,
          assets: {},
          events: [],
          market: {},
          offers: [],
        };
        saveWallet(wallet, address);
        return wallet;
      }
    }
  } catch (error) {
    console.error(`Unexpected error in getWallet. [Message: ${error.message}]`);
  }
};

export const addWalletAsset = async (wallet, newAsset) => {
  if (wallet && newAsset) {
    const updatedWallet = {
      ...wallet,
      assets: {
        ...wallet.assets,
        [newAsset.details.asset]: newAsset,
      },
    };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const addWalletEvent = async (wallet, newEvent) => {
  if (wallet && newEvent) {
    const updatedWallet = {
      ...wallet,
      events: [...wallet.events, newEvent],
    };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const addWalletOffer = async (wallet, newOffer) => {
  if (wallet && newOffer) {
    const updatedWallet = {
      ...wallet,
      offers: [...wallet.offers, newOffer],
    };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const setWalletAssets = async (wallet, assets) => {
  if (wallet && assets) {
    const updatedWallet = { ...wallet, assets: assets };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const setWalletEvents = async (wallet, events) => {
  if (wallet && events) {
    const updatedWallet = { ...wallet, events };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const setWalletOffers = async (wallet, offers) => {
  if (wallet && offers) {
    const updatedWallet = { ...wallet, offers };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const listWalletAsset = async (wallet, newAsset, newEvent) => {
  if (wallet && newAsset && newEvent) {
    const updatedWallet = {
      ...wallet,
      events: [...wallet.events, newEvent],
      market: {
        ...wallet.market,
        [newAsset.details.asset]: newAsset,
      },
    };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const delistWalletAsset = async (wallet, listedAsset, newEvent) => {
  if (wallet && wallet.market && listedAsset && newEvent) {
    const { [listedAsset.details.asset]: _, ...updatedMarket } = wallet.market;
    const updatedWallet = {
      ...wallet,
      events: [...wallet.events, newEvent],
      market: updatedMarket,
    };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const relistWalletAsset = async (wallet, listedAsset, newEvent) => {
  if (wallet && wallet.market && listedAsset && newEvent) {
    const { [listedAsset.details.asset]: _, ...updatedMarket } = wallet.market;
    const updatedWallet = {
      ...wallet,
      events: [...wallet.events, newEvent],
      market: {
        ...updatedMarket,
        [listedAsset.details.asset]: listedAsset,
      },
    };
    await saveWallet(updatedWallet);
    return updatedWallet;
  }
  return wallet;
};

export const saveWallet = async (wallet) => {
  try {
    if (wallet) {
      const reference = doc(firestore, "wallets", wallet.address);
      await setDoc(reference, wallet, { merge: true });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveWallet. [Message: ${error.message}]`
    );
  }
};
