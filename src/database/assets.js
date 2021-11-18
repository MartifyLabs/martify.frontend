import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from "firebase/firestore";
import { getAssetDetails } from "../cardano/blockfrost-api";
import { firebaseOptions } from "../config";

const app = initializeApp(firebaseOptions);

const db = getFirestore(app);

export const getAssets = async (assetIds) => {
  try {
    const assets = await Promise.all(
      assetIds.map(async (assetId) => await getAsset(assetId))
    );

    return assets;
  } catch (error) {
    console.error(`Unexpected error in getAssets. [Message: ${error.message}]`);
  }
};

export const getAsset = async (assetId) => {
  try {
    const reference = doc(db, "assets", assetId);

    const snapshot = await getDoc(reference);

    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      const assetDetails = await getAssetDetails(assetId);

      const asset = {
        details: assetDetails,
        offers: [],
        status: { locked: false },
      };

      await saveAsset(asset);

      return asset;
    }
  } catch (error) {
    console.error(`Unexpected error in getAsset. [Message: ${error.message}]`);
  }
};

export const getLockedAssets = async (page = 1, count = 100) => {
  try {
    const reference = await query(
      collection(db, "assets"),
      where("status.locked", "==", true),
      orderBy("status.submittedOn"),
      startAfter((page - 1) * count),
      limit(count)
    );

    const snapshot = await getDocs(reference);

    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error(
      `Unexpected error in getLockedAssets. [Message: ${error.message}]`
    );
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const lockAsset = async (
  asset,
  { datum, datumHash, txHash, address }
) => {
  if (datum && datumHash && txHash && address) {
    await saveAsset({
      ...asset,
      status: {
        datum,
        datumHash,
        locked: true,
        txHash,
        submittedBy: address,
        submittedOn: new Date().getTime(),
      },
    });
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const unlockAsset = async (asset, { txHash, address }) => {
  if (txHash && address) {
    await saveAsset({
      ...asset,
      status: {
        locked: false,
        txHash,
        submittedBy: address,
        submittedOn: new Date().getTime(),
      },
    });
  }
};

export const saveAsset = async (asset) => {
  try {
    if (asset) {
      const reference = doc(db, "assets", asset.details.asset);

      await setDoc(reference, asset, { merge: true });
    }
  } catch (error) {
    console.error(`Unexpected error in saveAsset. [Message: ${error.message}]`);
  }
};

export const saveAssets = async (assets) => {
  try {
    await Promise.all(
      assets.map(async (asset) => {
        await saveAsset(asset);
      })
    );
  } catch (error) {
    console.error(
      `Unexpected error in saveAssets. [Message: ${error.message}]`
    );
  }
};

export const setAssetOffers = async (asset, offers) => {
  if (offers) {
    await saveAsset({ ...asset, offers });
  }
};
