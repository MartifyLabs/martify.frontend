import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";

export const getCollection = async (policyId) => {
  try {
    if (policyId) {
      const reference = doc(firestore, "collections", policyId);

      const snapshot = await getDoc(reference);

      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        const collection = { verified: false };

        await saveCollection(collection, policyId);

        return collection;
      }
    }
  } catch (error) {
    console.error(
      `Unexpected error in getCollection. [Message: ${error.message}]`
    );
    throw error;
  }
};

export const saveCollection = async (collection, policyId) => {
  try {
    if (collection) {
      const reference = doc(firestore, "collections", policyId);

      await setDoc(reference, collection, { merge: true });
    }
  } catch (error) {
    console.error(
      `Unexpected error in saveCollection. [Message: ${error.message}]`
    );
    throw error;
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const setCollectionCreator = async (address, percentage, policyId) => {
  if (address && percentage) {
    await saveCollection({ royalties: { address, percentage } }, policyId);
  }
};

export const setCollectionStatus = async (verified: Boolean, policyId) => {
  await saveCollection({ verified }, policyId);
};
