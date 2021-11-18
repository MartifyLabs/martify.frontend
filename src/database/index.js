import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { getAssetDetails, getMintedAssets } from "../cardano/blockfrost-api";
import { firebaseOptions } from "../config";

const app = initializeApp(firebaseOptions);

const db = getFirestore(app);

export const getAssets = async (policyId) => {
  try {
    const result = await query(
      collection(db, "assets"),
      where("info.policyId", "==", policyId)
    );

    const snapshot = await getDocs(result);

    if (snapshot.empty) {
      const assetIds = await getMintedAssets(policyId);
      const assets = await Promise.all(
        assetIds.map(async (assetId) => await getAssetDetails(assetId))
      );

      await saveAssets(assets);
      return assets.map((asset) => {
        return { info: asset };
      });
    } else {
      return snapshot.docs.map((doc) => doc.data());
    }
  } catch (error) {
    console.error(`Unexpected error in getAssets. [Message: ${error.message}]`);
  }
};

export const getAsset = async (assetId) => {
  try {
    const result = await query(
      collection(db, "assets"),
      where("info.asset", "==", assetId)
    );

    const snapshot = await getDocs(result);

    if (snapshot.empty) {
      const asset = await getAssetDetails(assetId)
      
      await saveAssets([asset]);

      return { info: asset };
    } else {
      return snapshot.docs[0].data();
    }
  } catch (error) {
    console.error(`Unexpected error in getAsset. [Message: ${error.message}]`);
  }
};

export const saveAssets = async (assets) => {
  try {
    await Promise.all(
      assets.map(async (asset) => {
        if (asset && asset.onchainMetadata) {
          await setDoc(doc(db, "assets", asset.asset), {
            info: asset,
          }, { merge: true });
        }
      })
    );
  } catch (error) {
    console.error(
      `Unexpected error in saveAssets. [Message: ${error.message}]`
    );
  }
};

export const saveAsset = async (asset) => {
  try {
    if (asset) {
      await setDoc(doc(db, "assets", asset.info.asset), {
        ...asset
      });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveAsset. [Message: ${error.message}]`
    );
  }
};


export const getListedAssets = async (count, page) => {
  try {
    const result = await query(
      collection(db, "assets"),
      where("listing.is_listed", "==", true),
      // orderBy("listing.on"), // TODO: The query requires an index
      limit(count),
      // startAfter(page),
    );


    const snapshot = await getDocs(result);

    return snapshot.docs.map((doc) => doc.data());

  } catch (error) {
    console.error(`Unexpected error in getListedAssets. [Message: ${error.message}]`);
  }
};