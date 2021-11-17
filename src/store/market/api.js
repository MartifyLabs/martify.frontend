import { offer, update, cancel, purchase } from "../../cardano/market-contract/";
import { getWalletAddresses } from "../../cardano/wallet";
import { saveAsset, getAsset } from "../../database";
import { contractAddress } from "../../cardano/market-contract/validator";
import { getLockedUtxosByAsset } from "../../cardano/blockfrost-api";
import { collections_add_tokens } from "../collection/collectionActions";

import { setWalletLoading } from "../wallet/walletActions";
import { WALLET_STATE } from "../wallet/walletTypes";

function add_event_asset_history(asset, event){
  if(!("history" in asset)){
    asset.history = [];
  }
  asset.history.push(event);
}

export const listToken = (asset, price, callback) => async (dispatch) => {
  try {
    // note: if price == 0, means user wanna delist it
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.info.asset);

    // call market, list on market
    console.log(
      "listToken on market",
      asset.info.assetName,
      asset.info.policyId,
      price
    );
    let txHash = await offer(
      asset.info.assetName,
      asset.info.policyId,
      price.toString()
    );

    console.log("txHash", txHash);

    if (price > 0) {
      let wallet_address = await getWalletAddresses();
      let event = {
        type: "new-listing",
        is_listed: true,
        on: new Date().getTime(),
        price: price,
        addr: wallet_address,
        tx: txHash,
      }
      asset_updated.listing = event;
      add_event_asset_history(asset_updated, event);
    } else {
      asset_updated.listing = {
        is_listed: false,
      };
    }

    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.info.policyId,
      listing: {
        [asset_updated.info.asset]: asset_updated,
      },
    };
    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: "list-success" });
  
    
  } catch (error) {
    console.error(`Unexpected error in listToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const updateToken = (asset, newPrice, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.info.asset);
    
    console.log(
      "updateToken on market",
      asset.info.assetName,
      asset.info.policyId,
      newPrice
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.info.asset
    );

    let txHash = await update(
      asset.info.assetName,
      asset.info.policyId,
      asset.listing.price,
      newPrice,
      assetUtxos
    );
    console.log("txHash", txHash);

    asset_updated.listing = {
      ...asset_updated.listing,
      price: newPrice,
    };

    let event = {
      type: "price-update",
      on: new Date().getTime(),
      price: newPrice,
      tx: txHash,
    }
    add_event_asset_history(asset_updated, event);

    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.info.policyId,
      listing: {
        [asset_updated.info.asset]: asset_updated,
      },
    };

    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: "price-update-success" });
  } catch (error) {
    console.error(`Unexpected error in updateToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const delistToken = (asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.info.asset);
    
    console.log(
      "delistToken on market",
      asset.info.assetName,
      asset.info.policyId,
      asset.listing.price
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.info.asset
    );

    let txHash = await cancel(
      asset.info.assetName,
      asset.info.policyId,
      asset.listing.price,
      assetUtxos
    );
    console.log("txHash", txHash);

    asset_updated.listing = {
      is_listed: false,
    };

    let event = {
      type: "delist",
      on: new Date().getTime(),
      tx: txHash,
    }
    add_event_asset_history(asset_updated, event);

    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.info.policyId,
      listing: {
        [asset_updated.info.asset]: asset_updated,
      },
    };
    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: "delist-success" });
  } catch (error) {
    console.error(`Unexpected error in delistToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const purchaseToken = (asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.info.asset);
    
    console.log(
      "purchaseToken on market",
      asset.info.assetName,
      asset.info.policyId,
      asset.listing.price
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.info.asset
    );

    let txHash = await purchase(
      asset.info.assetName,
      asset.info.policyId,
      asset.listing.addr,
      asset.listing.price,
      assetUtxos
    );
    console.log("txHash", txHash);

    asset_updated.listing = {
      is_listed: false,
    };
    
    let event = {
      type: "purchase",
      on: new Date().getTime(),
      tx: txHash,
    }
    add_event_asset_history(asset_updated, event);

    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.info.policyId,
      listing: {
        [asset_updated.info.asset]: asset_updated,
      },
    };
    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: "purchase-success" });
  } catch (error) {
    console.error(`Unexpected error in purchaseToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};
