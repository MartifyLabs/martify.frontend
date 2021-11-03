import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
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
      console.log(
        `No Assets found for policyId: ${policyId} in firebase, will be querying blockfrost instead... Work In Progress...`
      );
    } else {
      return snapshot.docs.map((doc) => doc.data());
    }
  } catch (error) {
    console.error(`Unexpected error in getAssets. [Message: ${error.message}]`);
  }
};

export const getAsset = async (policyId, assetId) => {
  try {
    const result = await query(
      collection(db, "assets"),
      where("info.policyId", "==", policyId),
      where("info.asset", "==", assetId)
    );

    const snapshot = await getDocs(result);

    if (snapshot.empty) {
      console.log(
        `No Asset found with id: ${assetId} in firebase, will be querying blockfrost instead... Work In Progress...`
      );
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
        if(asset){
          await setDoc(doc(db, "assets", asset.asset), {
            info: asset
          });
        }
      })
    );
  } catch (error) {
    console.error(
      `Unexpected error in saveAssets. [Message: ${error.message}]`
    );
  }
};
