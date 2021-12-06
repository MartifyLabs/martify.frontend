import Cardano from "../../cardano/serialization-lib";
import {
  enableWallet,
  getCollateral,
  getNetworkId,
  getOwnedAssets,
  getUsedAddress,
  getUtxos,
} from "../../cardano/wallet";
import {
  getAsset,
  getAssets,
  lockAsset,
  unlockAsset,
  addAssetEvent,
} from "../../database/assets";
import { getCollection } from "../../database/collections";
import {
  getWallet,
  addWalletEvent,
  listWalletAsset,
  delistWalletAsset,
  relistWalletAsset,
  setWalletAssets,
} from "../../database/wallets";
import { WALLET_STATE, MARKET_TYPE } from "./walletTypes";
import {
  walletConnected,
  setWalletLoading,
  setWalletData,
} from "./walletActions";
import {
  listAsset,
  updateListing,
  cancelListing,
  purchaseAsset,
} from "../../cardano/market-contract/";
import { contractAddress } from "../../cardano/market-contract/validator";
import { createTxUnspentOutput } from "../../cardano/transaction";
import { getLockedUtxosByAsset } from "../../cardano/blockfrost-api";
import { collections_add_tokens } from "../collection/collectionActions";
import { fromBech32 } from "../../utils";
import { createEvent, createDatum } from "../../utils/factory";

export const connectWallet = (isSilent, callback) => async (dispatch) => {
  try {
    if (!isSilent) dispatch(setWalletLoading(WALLET_STATE.CONNECTING));

    if (await enableWallet()) {
      await Cardano.load();

      const namiNetworkId = await getNetworkId();
      const usedNetworkId = parseInt(process.env.REACT_APP_CARDANO_NETWORK_ID);

      if (usedNetworkId === namiNetworkId) {
        const connectedWallet = {
          nami: {
            network: namiNetworkId,
            collateral: await getCollateral(),
          },
          data: await getWallet(await getUsedAddress()),
        };

        dispatch(walletConnected(connectedWallet));
        callback({
          success: true,
          data: connectedWallet,
        });
      } else {
        dispatch(setWalletLoading(false));
        callback({
          success: false,
          msg: "Switch your Nami Wallet network.",
        });
      }
    }
  } catch (error) {
    console.error(
      `Unexpected error in connectWallet. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false, error });
  }
};

export const getWalletAssets = (wallet, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.GETTING_ASSETS));

    const ownedAssets = await getOwnedAssets();
    const ownedAssetsObj = (await getAssets(ownedAssets)).reduce((map, asset) => {
      map[asset.details.asset] = asset;
      return map;
    }, {});

    const updatedWallet = await setWalletAssets(wallet.data, ownedAssetsObj);

    dispatch(setWalletData(updatedWallet));
    callback({ success: true });
  } catch (error) {
    console.error(
      `Unexpected error in getWalletAssets. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false, error });
  }
};

export const listToken = (wallet, asset, price, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const collectionDetails = await getCollection(assetOld.details.policyId);
    const walletUtxos = await getUtxos();

    const royaltiesAddress =
      collectionDetails?.royalties?.address ?? wallet.data.address;
    const royaltiesPercentage = collectionDetails?.royalties?.percentage ?? 0;

    const datum = createDatum(
      assetOld.details.assetName,
      assetOld.details.policyId,
      wallet.data.address,
      royaltiesAddress,
      royaltiesPercentage,
      price
    );

    const listObj = await listAsset(datum, {
      address: fromBech32(wallet.data.address),
      utxos: walletUtxos,
    });

    if (listObj && listObj.datumHash && listObj.txHash) {
      const assetNew = await lockAsset(assetOld, {
        datum: datum,
        datumHash: listObj.datumHash,
        txHash: listObj.txHash,
        address: wallet.data.address,
        artistAddress: royaltiesAddress,
        contractAddress: contractAddress().to_bech32(),
      });

      const event = createEvent(
        MARKET_TYPE.NEW_LISTING,
        datum,
        listObj.txHash,
        wallet.data.address
      );

      const updatedWallet = await listWalletAsset(wallet, assetNew, event);

      const output = {
        policy_id: assetNew.details.policyId,
        listing: {
          [assetNew.details.asset]: assetNew,
        },
      };

      dispatch(setWalletLoading(false));
      dispatch(setWalletData(updatedWallet));
      dispatch(collections_add_tokens(output));
      callback({ success: true, type: MARKET_TYPE.NEW_LISTING });
    } else {
      console.error("List Failed...");
      dispatch(setWalletLoading(false));
      callback({ success: false });
    }
  } catch (error) {
    console.error(`Unexpected error in listToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const relistToken = (wallet, asset, newPrice, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const walletUtxos = await getUtxos();

    const assetUtxo = (
      await getLockedUtxosByAsset(
        contractAddress().to_bech32(),
        assetOld.details.asset
      )
    ).find((utxo) => utxo.data_hash === assetOld.status.datumHash);

    if (assetUtxo) {
      const datumNew = createDatum(
        assetOld.status.datum.tn,
        assetOld.status.datum.cs,
        wallet.data.address,
        assetOld.status.artistAddress,
        assetOld.status.datum.rp,
        newPrice
      );
      const updateObj = await updateListing(
        assetOld.status.datum,
        datumNew,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        createTxUnspentOutput(contractAddress(), assetUtxo)
      );

      if (updateObj && updateObj.datumHash && updateObj.txHash) {
        const assetNew = await lockAsset(assetOld, {
          datum: datumNew,
          datumHash: updateObj.datumHash,
          txHash: updateObj.txHash,
          address: wallet.data.address,
          artistAddress: assetOld.status.artistAddress,
          contractAddress: contractAddress().to_bech32(),
        });

        const event = createEvent(
          MARKET_TYPE.PRICE_UPDATE,
          datumNew,
          updateObj.txHash,
          wallet.data.address
        );

        const updatedWallet = await relistWalletAsset(wallet, assetNew, event);

        const output = {
          policy_id: asset.details.policyId,
          listing: {
            [assetNew.details.asset]: assetNew,
          },
        };

        dispatch(setWalletLoading(false));
        dispatch(setWalletData(updatedWallet));
        dispatch(collections_add_tokens(output));
        callback({ success: true, type: MARKET_TYPE.PRICE_UPDATE });
      } else {
        console.error("Update Failed...");
        dispatch(setWalletLoading(false));
        callback({ success: false });
      }
    } else {
      console.error("Update Failed, Datum Hash not matching...");
      dispatch(setWalletLoading(false));
      callback({ success: false });
    }
  } catch (error) {
    console.error(
      `Unexpected error in relistToken. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const delistToken = (wallet, asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const walletUtxos = await getUtxos();

    const assetUtxo = (
      await getLockedUtxosByAsset(
        contractAddress().to_bech32(),
        assetOld.details.asset
      )
    ).find((utxo) => utxo.data_hash === assetOld.status.datumHash);

    if (assetUtxo) {
      const txHash = await cancelListing(
        assetOld.status.datum,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        createTxUnspentOutput(contractAddress(), assetUtxo)
      );

      if (txHash) {
        const assetNew = await unlockAsset(assetOld, {
          txHash: txHash,
          address: wallet.data.address,
        });

        const event = createEvent(
          MARKET_TYPE.DELIST,
          assetOld.status.datum,
          txHash,
          wallet.data.address
        );

        const updatedWallet = await delistWalletAsset(wallet, assetNew, event);

        const output = {
          policy_id: assetNew.details.policyId,
          listing: {
            [assetNew.details.asset]: assetNew,
          },
        };

        dispatch(setWalletLoading(false));
        dispatch(setWalletData(updatedWallet));
        dispatch(collections_add_tokens(output));
        callback({ success: true, type: MARKET_TYPE.DELIST });
      } else {
        console.error("Cancel Failed...");
        dispatch(setWalletLoading(false));
        callback({ success: false });
      }
    } else {
      console.error("Cancel Failed, Datum Hash not matching...");
      dispatch(setWalletLoading(false));
      callback({ success: false });
    }
  } catch (error) {
    console.error(
      `Unexpected error in delistToken. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const purchaseToken = (wallet, asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const walletUtxos = await getUtxos();

    const assetUtxo = (
      await getLockedUtxosByAsset(
        contractAddress().to_bech32(),
        assetOld.details.asset
      )
    ).find((utxo) => utxo.data_hash === assetOld.status.datumHash);

    if (assetUtxo) {
      const txHash = await purchaseAsset(
        assetOld.status.datum,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        {
          seller: fromBech32(assetOld.status.submittedBy),
          artist: fromBech32(assetOld.status.artistAddress),
          // TODO: Fetch market address
          market: fromBech32(
            "addr_test1qp6pykcc0kgaqj27z3jg4sjt7768p375qr8q4z3f4xdmf38skpyf2kgu5wqpnm54y5rqgee4uwyksg6eyd364qhmpwqsv2jjt3"
          ),
          // ----------------------------------------
        },
        createTxUnspentOutput(contractAddress(), assetUtxo)
      );

      if (txHash) {
        const unlockedAsset = await unlockAsset(assetOld, {
          txHash: txHash,
          address: wallet.data.address,
        });

        const event = createEvent(
          MARKET_TYPE.PURCHASE,
          assetOld.status.datum,
          txHash,
          wallet.data.address
        );

        await addWalletEvent(wallet, event);

        const assetNew = await addAssetEvent(unlockedAsset, event);

        // Update the seller's wallet
        const sellerWalletObj = await getWallet(assetOld.status.submittedBy);

        const soldEvent = createEvent(
          MARKET_TYPE.SOLD,
          assetOld.status.datum,
          txHash,
          wallet.data.address
        );

        await delistWalletAsset(sellerWalletObj, assetNew, soldEvent);

        const output = {
          policy_id: asset.details.policyId,
          listing: {
            [assetNew.details.asset]: assetNew,
          },
        };

        dispatch(setWalletLoading(false));
        dispatch(collections_add_tokens(output));
        callback({ success: true, type: MARKET_TYPE.PURCHASE });
      } else {
        console.error("Purchase Failed...");
        dispatch(setWalletLoading(false));
        callback({ success: false });
      }
    } else {
      console.error("Purchase Failed, Datum Hash not matching...");
      dispatch(setWalletLoading(false));
      callback({ success: false });
    }
  } catch (error) {
    console.error(
      `Unexpected error in purchaseToken. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};
