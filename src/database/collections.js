import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getMintedAssets } from "../cardano/blockfrost-api";
import { firebaseOptions } from "../config";

const app = initializeApp(firebaseOptions);

const db = getFirestore(app);

export const getCollection = async (policyId) => {
  try {
    const reference = doc(db, "collections", policyId);

    const snapshot = await getDoc(reference);

    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      const assets = await fetchAllAssetsForCollection(policyId);

      const collection = { assets };

      await saveCollection(collection, policyId);

      return collection;
    }
  } catch (error) {
    console.error(
      `Unexpected error in getCollection. [Message: ${error.message}]`
    );
  }
};

export const saveCollectionRoyalties = async (
  collection,
  { address, percentage }
) => {
  if (address && percentage) {
    await saveCollection({ ...collection, royalties: { address, percentage } });
  }
};

export const saveCollectionVerificationStatus = async (
  collection,
  verified: Boolean
) => {
  await saveCollection({ ...collection, verified });
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

const fetchAllAssetsForCollection = async (policyId, page = 1) => {
  const assets = await getMintedAssets(policyId, { page });

  if (assets) {
    return [...assets, ...(await fetchAllAssetsForCollection(policyId, page++))];
  }

  return [];
};
