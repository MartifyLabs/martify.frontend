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

export const loadAssets = (wallet, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.GETTING_ASSETS));

    const ownedAssets = await getOwnedAssets();
    const assets = (await getAssets(ownedAssets)).reduce((map, asset) => {
      map[asset.details.asset] = asset;
      return map;
    }, {});

    const updatedWallet = await setWalletAssets(wallet.data, assets);

    dispatch(setWalletData(updatedWallet));
    callback({ success: true });
  } catch (error) {
    console.error(
      `Unexpected error in loadAssets. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false, error });
  }
};

export const listToken =
  (wallet, asset, price, callback) => async (dispatch) => {
    try {
      dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

      const collectionDetails = await getCollection(asset.details.policyId);
      const walletUtxos = await getUtxos();

      const royaltiesAddress =
        collectionDetails?.royalties?.address ?? wallet.data.address;
      const royaltiesPercentage = collectionDetails?.royalties?.percentage ?? 0;

      const datum = createDatum(
        asset.details.assetName,
        asset.details.policyId,
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
        const updatedAsset = await lockAsset(asset, {
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

        const updatedWallet = await listWalletAsset(
          wallet.data,
          updatedAsset,
          event
        );

        const output = {
          policy_id: updatedAsset.details.policyId,
          listing: {
            [updatedAsset.details.asset]: updatedAsset,
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
      console.error(
        `Unexpected error in listToken. [Message: ${error.message}]`
      );
      dispatch(setWalletLoading(false));
      callback({ success: false });
    }
  };

export const relistToken =
  (wallet, asset, newPrice, callback) => async (dispatch) => {
    try {
      dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

      const walletUtxos = await getUtxos();

      const assetUtxo = (
        await getLockedUtxosByAsset(
          contractAddress().to_bech32(),
          asset.details.asset
        )
      ).find((utxo) => utxo.data_hash === asset.status.datumHash);

      if (assetUtxo) {
        const datumNew = createDatum(
          asset.status.datum.tn,
          asset.status.datum.cs,
          wallet.data.address,
          asset.status.artistAddress,
          asset.status.datum.rp,
          newPrice
        );
        const updateObj = await updateListing(
          asset.status.datum,
          datumNew,
          {
            address: fromBech32(wallet.data.address),
            utxos: walletUtxos,
          },
          createTxUnspentOutput(contractAddress(), assetUtxo)
        );

        if (updateObj && updateObj.datumHash && updateObj.txHash) {
          const updatedAsset = await lockAsset(asset, {
            datum: datumNew,
            datumHash: updateObj.datumHash,
            txHash: updateObj.txHash,
            address: wallet.data.address,
            artistAddress: asset.status.artistAddress,
            contractAddress: contractAddress().to_bech32(),
          });

          const event = createEvent(
            MARKET_TYPE.PRICE_UPDATE,
            datumNew,
            updateObj.txHash,
            wallet.data.address
          );

          const updatedWallet = await relistWalletAsset(
            wallet.data,
            updatedAsset,
            event
          );

          const output = {
            policy_id: asset.details.policyId,
            listing: {
              [updatedAsset.details.asset]: updatedAsset,
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

    const walletUtxos = await getUtxos();

    const assetUtxo = (
      await getLockedUtxosByAsset(
        contractAddress().to_bech32(),
        asset.details.asset
      )
    ).find((utxo) => utxo.data_hash === asset.status.datumHash);

    if (assetUtxo) {
      const txHash = await cancelListing(
        asset.status.datum,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        createTxUnspentOutput(contractAddress(), assetUtxo)
      );

      if (txHash) {
        const updatedAsset = await unlockAsset(asset, {
          txHash: txHash,
          address: wallet.data.address,
        });

        const event = createEvent(
          MARKET_TYPE.DELIST,
          asset.status.datum,
          txHash,
          wallet.data.address
        );

        const updatedWallet = await delistWalletAsset(
          wallet.data,
          updatedAsset,
          event
        );

        const output = {
          policy_id: updatedAsset.details.policyId,
          listing: {
            [updatedAsset.details.asset]: updatedAsset,
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

    const walletUtxos = await getUtxos();

    const assetUtxo = (
      await getLockedUtxosByAsset(
        contractAddress().to_bech32(),
        asset.details.asset
      )
    ).find((utxo) => utxo.data_hash === asset.status.datumHash);

    if (assetUtxo) {
      const txHash = await purchaseAsset(
        asset.status.datum,
        {
          address: fromBech32(wallet.data.address),
          utxos: walletUtxos,
        },
        {
          seller: fromBech32(asset.status.submittedBy),
          artist: fromBech32(asset.status.artistAddress),
          // TODO: Fetch market address
          market: fromBech32(
            "addr_test1qp6pykcc0kgaqj27z3jg4sjt7768p375qr8q4z3f4xdmf38skpyf2kgu5wqpnm54y5rqgee4uwyksg6eyd364qhmpwqsv2jjt3"
          ),
          // ----------------------------------------
        },
        createTxUnspentOutput(contractAddress(), assetUtxo)
      );

      if (txHash) {
        const unlockedAsset = await unlockAsset(asset, {
          txHash: txHash,
          address: wallet.data.address,
        });

        const event = createEvent(
          MARKET_TYPE.PURCHASE,
          asset.status.datum,
          txHash,
          wallet.data.address
        );

        await addWalletEvent(wallet.data, event);

        const updatedAsset = await addAssetEvent(unlockedAsset, event);

        // Update the seller's wallet
        const sellerWalletObj = await getWallet(asset.status.submittedBy);

        const soldEvent = createEvent(
          MARKET_TYPE.SOLD,
          asset.status.datum,
          txHash,
          wallet.data.address
        );

        await delistWalletAsset(sellerWalletObj, updatedAsset, soldEvent);

        const output = {
          policy_id: asset.details.policyId,
          listing: {
            [updatedAsset.details.asset]: updatedAsset,
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
