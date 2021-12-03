import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from "firebase/firestore";
import { getAssetDetails, getMintedAssets } from "../cardano/blockfrost-api";
import { firestore } from "../firebase";

export const addAssetEvent = async (asset, newEvent) => {
  if (asset && newEvent) {
    const assetUpdated = {
      ...asset,
      events: [...(asset.events || []), newEvent],
    };
    await saveAsset(assetUpdated);
    return assetUpdated;
  }
  return asset;
};

export const addAssetOffer = async (asset, newOffer) => {
  if (asset && newOffer) {
    const assetUpdated = {
      ...asset,
      offers: [...(asset.offers || []), newOffer],
    };
    await saveAsset(assetUpdated);
    return assetUpdated;
  }
  return asset;
};

export const getAsset = async (assetId) => {
  try {
    if (assetId) {
      const reference = doc(firestore, "assets", assetId);

      const snapshot = await getDoc(reference);

      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        const assetDetails = await getAssetDetails(assetId);

        if (assetDetails) {
          const asset = {
            details: assetDetails,
            events: [],
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
    throw error;
  }
};

export const getAssets = async (assetIds) => {
  if (assetIds) {
    const assets = await Promise.all(
      assetIds.map(async (assetId) => await getAsset(assetId))
    );
    return assets.filter((asset) => asset !== undefined);
  }
};

export const getCollectionAssets = async (policyId, page = 1, count = 100) => {
  if (policyId) {
    const reference = await query(
      collection(firestore, "assets"),
      where("details.policyId", "==", policyId),
      startAfter((page - 1) * count),
      limit(count)
    );

    const snapshot = await getDocs(reference);
    
    if (snapshot.exists()) {
      return snapshot.docs.map((doc) => doc.data());
    } else {
      const assetIds = await getMintedAssets(policyId, { page, count });
      return await getAssets(assetIds);
    }
  }
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const lockAsset = async (
  asset,
  { datum, datumHash, txHash, address, artistAddress, contractAddress }
) => {
  if (
    asset &&
    datum &&
    datumHash &&
    txHash &&
    address &&
    artistAddress &&
    contractAddress
  ) {
    const assetUpdated = {
      ...asset,
      status: {
        datum,
        datumHash,
        locked: true,
        txHash,
        artistAddress,
        contractAddress,
        submittedBy: address,
        submittedOn: new Date().getTime(),
      },
    };
    await saveAsset(assetUpdated);
    return assetUpdated;
  }
  return asset;
};

/**
 * @param {string} address - address needs to be in bech32 format.
 */
export const unlockAsset = async (asset, { txHash, address }) => {
  if (asset && txHash && address) {
    const assetUpdated = {
      ...asset,
      status: {
        locked: false,
        txHash,
        submittedBy: address,
        submittedOn: new Date().getTime(),
      },
    };
    await saveAsset(assetUpdated);
    return assetUpdated;
  }
  return asset;
};

export const getLockedAssets = async (page = 1, count = 100) => {
  try {
    const reference = await query(
      collection(firestore, "assets"),
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
    throw error;
  }
};

export const saveAsset = async (asset) => {
  try {
    if (asset) {
      const reference = doc(firestore, "assets", asset.details.asset);
      await setDoc(reference, asset, { merge: true });
    }
  } catch (error) {
    console.error(`Unexpected error in saveAsset. [Message: ${error.message}]`);
    throw error;
  }
};

export const saveAssets = async (assets) => {
  if (assets) {
    await Promise.all(
      assets.map(async (asset) => {
        await saveAsset(asset);
      })
    );
  }
};
