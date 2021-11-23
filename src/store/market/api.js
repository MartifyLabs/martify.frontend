import {
  listAsset,
  updateListing,
  cancelListing,
  purchaseAsset,
} from "../../cardano/market-contract/";
import { getUsedAddress, getUtxos } from "../../cardano/wallet";
import { contractAddress } from "../../cardano/market-contract/validator";
import { getLockedUtxosByAsset } from "../../cardano/blockfrost-api";

import { getWallet, addWalletEvent, addWalletAsset } from "../../database/wallets";
import {
  getAsset,
  lockAsset,
  unlockAsset,
  addAssetEvent,
} from "../../database/assets";

import { collections_add_tokens } from "../collection/collectionActions";
import { setWalletLoading } from "../wallet/walletActions";
import { WALLET_STATE } from "../wallet/walletTypes";
import { MARKET_TYPE } from "./marketTypes";
import { fromBech32 } from "../../utils";
import { createEvent, createDatum } from "../../utils/factory";

export const listToken = (asset, price, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const walletAddress = await getUsedAddress();
    const walletUtxos = await getUtxos();
    // TODO: Fetch royalties from collection
    const royaltiesAddress = walletAddress;
    const royaltiesPercentage = 0;
    // _____________________________________

    const datum = createDatum(
      assetOld.details.assetName,
      assetOld.details.policyId,
      walletAddress,
      royaltiesAddress,
      royaltiesPercentage,
      price
    );

    const listObj = await listAsset(datum, {
      address: fromBech32(walletAddress),
      utxos: walletUtxos,
    });

    if (listObj && listObj.datumHash && listObj.txHash) {
      let walletObj = await getWallet(walletAddress);

      const event = createEvent(
        MARKET_TYPE.NEW_LISTING,
        datum,
        listObj.txHash,
        walletAddress
      );
      console.log("listing event", event)
      walletObj = await addWalletEvent(walletObj, event);

      const assetNew = await lockAsset(assetOld, {
        datum: datum,
        datumHash: listObj.datumHash,
        txHash: listObj.txHash,
        address: walletAddress,
      });

      walletObj = await addWalletAsset(walletObj, assetNew);

      const output = {
        policy_id: assetNew.details.policyId,
        listing: {
          [assetNew.details.asset]: assetNew,
        },
      };

      dispatch(setWalletLoading(false));
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

export const updateToken = (asset, newPrice, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const walletAddress = await getUsedAddress();
    const walletUtxos = await getUtxos();
    // TODO: Fetch royalties from collection
    const royaltiesAddress = walletAddress;
    // _____________________________________

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
        walletAddress,
        royaltiesAddress,
        assetOld.status.datum.rp,
        newPrice
      );
      const updateObj = await updateListing(
        assetOld.status.datum,
        datumNew,
        {
          address: fromBech32(walletAddress),
          utxos: walletUtxos,
        },
        assetUtxo
      );

      if (updateObj) {
        let walletObj = await getWallet(walletAddress);

        const event = createEvent(
          MARKET_TYPE.PRICE_UPDATE,
          datumNew,
          updateObj.txHash,
          walletAddress
        );

        walletObj = await addWalletEvent(walletObj, event);

        const assetNew = await lockAsset(assetOld, {
          datum: datumNew,
          datumHash: updateObj.datumHash,
          txHash: updateObj.txHash,
          address: walletAddress,
        });

        walletObj = await addWalletAsset(walletObj, assetNew);

        const output = {
          policy_id: asset.details.policyId,
          listing: {
            [assetNew.details.asset]: assetNew,
          },
        };

        dispatch(setWalletLoading(false));
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
      `Unexpected error in updateToken. [Message: ${error.message}]`
    );
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const delistToken = (asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const walletAddress = await getUsedAddress();
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
          address: fromBech32(walletAddress),
          utxos: walletUtxos,
        },
        assetUtxo
      );

      if (txHash) {
        const assetNew = await unlockAsset(assetOld, {
          txHash: txHash,
          address: walletAddress,
        });

        let walletObj = await getWallet(walletAddress);

        const event = createEvent(
          MARKET_TYPE.DELIST,
          assetOld.status.datum,
          txHash,
          walletAddress
        );

        walletObj = await addWalletEvent(walletObj, event);
        walletObj = await addWalletAsset(walletObj, assetNew);

        const output = {
          policy_id: assetNew.details.policyId,
          listing: {
            [assetNew.details.asset]: assetNew,
          },
        };

        dispatch(setWalletLoading(false));
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

export const purchaseToken = (asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    const assetOld = await getAsset(asset.details.asset);
    const walletAddress = await getUsedAddress();
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
          address: fromBech32(walletAddress),
          utxos: walletUtxos,
        },
        {
          seller: fromBech32(assetOld.status.submittedBy),
          // TODO: Fetch royalties and market address
          artist: fromBech32(assetOld.status.submittedBy),
          market: fromBech32(
            "addr_test1qp6pykcc0kgaqj27z3jg4sjt7768p375qr8q4z3f4xdmf38skpyf2kgu5wqpnm54y5rqgee4uwyksg6eyd364qhmpwqsv2jjt3"
          ),
          // ----------------------------------------
        },
        assetUtxo
      );

      if (txHash) {
        let walletObj = await getWallet(walletAddress);
        
        const event = createEvent(
          MARKET_TYPE.PURCHASE,
          assetOld.status.datum,
          txHash,
          walletAddress
        );
        console.log("event", event)
        walletObj = await addWalletEvent(walletObj, event);

        const unlockedAsset = await unlockAsset(assetOld, {
          txHash: txHash,
          address: walletAddress,
        });

        let assetNew = await addAssetEvent(unlockedAsset, event);

        walletObj = await addWalletAsset(walletObj, assetNew);

        const output = {
          policy_id: asset.details.policyId,
          listing: {
            [assetNew.details.asset]: assetNew,
          },
        };

        // seller

        let sellerWalletObj = await getWallet(assetOld.status.submittedBy);
        const event_seller = createEvent(
          MARKET_TYPE.SOLD,
          assetOld.status.datum,
          txHash,
          walletAddress
        );
        sellerWalletObj = await addWalletEvent(sellerWalletObj, event_seller);
        sellerWalletObj = await addWalletAsset(sellerWalletObj, assetNew);

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
