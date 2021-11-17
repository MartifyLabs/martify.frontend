import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getAssetDetails } from "../cardano/blockfrost-api";
import { firebaseOptions } from "../config";

const app = initializeApp(firebaseOptions);

const db = getFirestore(app);

export const getAsset = async (assetId) => {
  try {
    const reference = doc(db, "assets", assetId);

    const snapshot = await getDoc(reference);

    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      const assetDetails = await getAssetDetails(assetId);

      const asset = { details: assetDetails };

      await saveAsset(asset);

      return asset;
    }
  } catch (error) {
    console.error(`Unexpected error in getAsset. [Message: ${error.message}]`);
  }
};

export const saveAssetTx = async (asset, datum, txHash, address) => {
  if (datum && txHash && address) {
    await saveAsset({
      ...asset,
      datum,
      txHash,
      submittedBy: address,
      submittedOn: new Date().getTime(),
    });
  }
};

export const saveAssetDatum = async (asset, datum) => {
  if (datum) {
    await saveAsset({ ...asset, datum });
  }
};

export const saveAssetOffers = async (asset, offers) => {
  if (offers) {
    await saveAsset({ ...asset, offers });
  }
};

export const saveAssetTxHash = async (asset, txHash) => {
  if (txHash) {
    await saveAsset({ ...asset, txHash });
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const saveAssetSubmission = async (asset, address) => {
  if (address) {
    await saveAsset({
      ...asset,
      submittedBy: address,
      submittedOn: new Date().getTime(),
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
