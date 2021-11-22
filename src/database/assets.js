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

export const addAssetOffer = async (asset, newOffer) => {
  if (asset && newOffer) {
    await saveAsset({
      ...asset,
      offers: [...asset.offers, newOffer],
    });
  }
};

export const getAsset = async (assetId) => {
  try {
    if (assetId) {
      const reference = doc(db, "assets", assetId);

      const snapshot = await getDoc(reference);

      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        const assetDetails = await getAssetDetails(assetId);

        if (assetDetails) {
          const asset = {
            details: assetDetails,
            offers: [],
            status: { locked: false },
          };

          await saveAsset(asset);

          return asset;
        }

        return undefined;
      }
    }
  } catch (error) {
    console.error(`Unexpected error in getAsset. [Message: ${error.message}]`);
  }
};

export const getAssets = async (assetIds) => {
  try {
    if (assetIds) {
      const assets = await Promise.all(
        assetIds
          .map(async (assetId) => await getAsset(assetId))
          .filter((asset) => asset !== undefined)
      );
      return assets;
    }
  } catch (error) {
    console.error(`Unexpected error in getAssets. [Message: ${error.message}]`);
  }
};

export const getLockedAssets = async (page = 1, count = 100) => {
  try {
    const reference = await query(
      collection(db, "assets"),
      where("status.locked", "==", true),
      // orderBy("status.submittedOn"), // TODO: The query requires an index.
      // startAfter((page - 1) * count), // TODO: having this returns undefined
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
  if (asset && datum && datumHash && txHash && address) {
    let asset_updated = {
      ...asset,
      status: {
        datum,
        datumHash,
        locked: true,
        txHash,
        submittedBy: address,
        submittedOn: new Date().getTime(),
      },
    }
    await saveAsset(asset_updated);
    return asset_updated;
  }
  return asset;
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const unlockAsset = async (asset, { txHash, address }) => {
  if (asset && txHash && address) {
    let asset_updated = {
      ...asset,
      status: {
        locked: false,
        txHash,
        submittedBy: address,
        submittedOn: new Date().getTime(),
      },
    };
    await saveAsset(asset_updated);
    return asset_updated;
  }
  return asset;
};

export const saveAsset = async (asset) => {
  try {
    if (asset) {
      const reference = doc(db, "assets", asset.details.asset);
      await setDoc(reference, asset, { merge: true });
    }
  } catch (error) {
    console.error(`Unexpected error in saveAsset1. [Message: ${error.message}]`);
  }
};

export const saveAssets = async (assets) => {
  try {
    if (assets) {
      await Promise.all(
        assets.map(async (asset) => {
          await saveAsset(asset);
        })
      );
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveAssets. [Message: ${error.message}]`
    );
  }
};

export const setAssetOffers = async (asset, offers) => {
  if (asset && offers) {
    await saveAsset({ ...asset, offers });
  }
};

export const addAssetEvent = async (asset, event) => {
  if (asset && event) {
    let asset_updated = {
      ...asset
    }
    if(!("events" in asset_updated)) asset_updated.events = [];
    asset_updated.events.push(event);
    await saveAsset(asset_updated);
    return asset_updated;
  }
  return asset;
};
