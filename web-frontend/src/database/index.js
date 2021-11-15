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
} from "firebase/firestore";
import { getAssetInfo, getMintedAssets } from "../cardano/blockfrost-api";
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
        assetIds.map(async (assetId) => await getAssetInfo(assetId))
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
      const asset = await getAssetInfo(assetId)

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
