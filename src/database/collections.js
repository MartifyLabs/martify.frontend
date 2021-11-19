import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getMintedAssets } from "../cardano/blockfrost-api";
import { firebaseOptions } from "../config";

const app = initializeApp(firebaseOptions);

const db = getFirestore(app);

export const getCollection = async (policyId) => {
  try {
    if (policyId) {
      const reference = doc(db, "collections", policyId);

      const snapshot = await getDoc(reference);

      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        const assets = await fetchAllAssetsForCollection(policyId);

        const collection = { assets, verified: false };

        await saveCollection(collection, policyId);

        return collection;
      }
    }
  } catch (error) {
    console.error(
      `Unexpected error in getCollection. [Message: ${error.message}]`
    );
  }
};

export const saveCollection = async (collection, policyId) => {
  try {
    if (collection) {
      const reference = doc(db, "collections", policyId);

      await setDoc(reference, collection, { merge: true });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveCollection. [Message: ${error.message}]`
    );
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setCollectionRoyalties = async (
  collection,
  { address, percentage }
) => {
  if (collection && address && percentage) {
    await saveCollection({ ...collection, royalties: { address, percentage } });
  }
};

export const setCollectionStatus = async (collection, verified: Boolean) => {
  if (collection) {
    await saveCollection({ ...collection, verified });
  }
};

const fetchAllAssetsForCollection = async (policyId, page = 1) => {
  const assets = await getMintedAssets(policyId, { page });

  if (assets.length) {
    return [
      ...assets,
      ...(await fetchAllAssetsForCollection(policyId, ++page)),
    ];
  }

  return [];
};
