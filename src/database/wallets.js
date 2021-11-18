import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { firebaseOptions } from "../config";

const app = initializeApp(firebaseOptions);

const db = getFirestore(app);

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const getWallet = async (address) => {
  try {
    if (address) {
      const reference = doc(db, "wallets", address);

      const snapshot = await getDoc(reference);

      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        const wallet = {
          address,
          assets: [],
          events: [],
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
    await saveWallet({
      ...wallet,
      assets: [...wallet.assets, newAsset],
    });
  }
};

export const addWalletEvent = async (wallet, newEvent) => {
  if (wallet && newEvent) {
    await saveWallet({
      ...wallet,
      events: [...wallet.events, newEvent],
    });
  }
};

export const addWalletOffer = async (wallet, newOffer) => {
  if (wallet && newOffer) {
    await saveWallet({
      ...wallet,
      offers: [...wallet.offers, newOffer],
    });
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setWalletAssets = async (wallet, assets) => {
  if (assets) {
    await saveWallet({ ...wallet, assets });
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setWalletEvents = async (wallet, events) => {
  if (events) {
    await saveWallet({ ...wallet, events });
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setWalletOffers = async (wallet, offers) => {
  if (offers) {
    await saveWallet({ ...wallet, offers });
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const saveWallet = async (wallet) => {
  try {
    if (wallet) {
      const reference = doc(db, "wallets", wallet.address);

      await setDoc(reference, wallet, { merge: true });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveWallet. [Message: ${error.message}]`
    );
  }
};
