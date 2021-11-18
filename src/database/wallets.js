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
    const reference = doc(db, "wallets", address);

    const snapshot = await getDoc(reference);

    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Unexpected error in getWallet. [Message: ${error.message}]`);
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setWalletAssets = async (address, assets) => {
  if (address && assets) {
    await saveWallet({ assets }, address);
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setWalletEvents = async (address, events) => {
  if (address && events) {
    await saveWallet({ events }, address);
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setWalletOffers = async (address, offers) => {
  if (address && offers) {
    await saveWallet({ offers }, address);
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const saveWallet = async (wallet, address) => {
  try {
    if (wallet) {
      const reference = doc(db, "wallets", address);

      await setDoc(reference, wallet, { merge: true });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveWallet. [Message: ${error.message}]`
    );
  }
};
