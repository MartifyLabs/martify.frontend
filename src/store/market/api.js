import { offer, update, cancel, purchase } from "../../cardano/market-contract/";
import { getUsedAddress } from "../../cardano/wallet";
import { saveAsset, getAsset } from "../../database/assets";
import { contractAddress } from "../../cardano/market-contract/validator";
import { getLockedUtxosByAsset } from "../../cardano/blockfrost-api";
import { collections_add_tokens } from "../collection/collectionActions";

import { setWalletLoading } from "../wallet/walletActions";
import { WALLET_STATE } from "../wallet/walletTypes";
import { MARKET_TYPE } from "./marketTypes";

import { createEvent, createDatum } from "../../utils/factory";
import { getWallet, addWalletEvent } from "../../database/wallets";

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

    let asset_updated = await getAsset(asset.details.asset);

    // call market, list on market
    console.log(
      "listToken on market",
      asset.details.assetName,
      asset.details.policyId,
      price
    );
    let txHash = await offer(
      asset.details.assetName,
      asset.details.policyId,
      price.toString()
    );

    console.log("txHash", txHash);

    if (price > 0) {

      let wallet_address = (await getUsedAddress()).to_bech32();

      let wallet = await getWallet(wallet_address);
      console.log("wallet", wallet);

      let royaltiesAddress = wallet_address;
      let royaltiesPercentage = 0;

      let datum = createDatum(
        asset.details.asset,
        asset.details.policyId,
        wallet_address,
        royaltiesAddress,
        royaltiesPercentage,
        price,
      );

      let this_event = createEvent(
        MARKET_TYPE.NEW_LISTING,
        datum,
        txHash,
        wallet_address,
      );
      console.log("this_event", this_event);
      await addWalletEvent(wallet, this_event);

      let this_listing = {
        is_listed: true,
        on: new Date().getTime(),
        datum: datum,
      }
      asset_updated.listing = this_listing;

    } else {
      asset_updated.listing = {
        is_listed: false,
      };
    }

    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.details.policyId,
      listing: {
        [asset_updated.details.asset]: asset_updated,
      },
    };
    
    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: MARKET_TYPE.NEW_LISTING_SUCCESS });
  } catch (error) {
    console.error(`Unexpected error in listToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const updateToken = (asset, newPrice, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.details.asset);
    
    console.log(
      "updateToken on market",
      asset.details.assetName,
      asset.details.policyId,
      newPrice
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.details.asset
    );

    let txHash = await update(
      asset.details.assetName,
      asset.details.policyId,
      asset.listing.price,
      newPrice,
      assetUtxos
    );
    console.log("txHash", txHash);

    asset_updated.listing = {
      ...asset_updated.listing,
      price: newPrice,
    };

    // let event = {
    //   type: MARKET_TYPE.PRICE_UPDATE,
    //   on: new Date().getTime(),
    //   price: newPrice,
    //   tx: txHash,
    // }
    // add_event_asset_history(asset_updated, event);

    
    let wallet_address = (await getUsedAddress()).to_bech32();

    let wallet = await getWallet(wallet_address);
    console.log("wallet", wallet);

    let royaltiesAddress = wallet_address;
    let royaltiesPercentage = 0;

    let datum = createDatum(
      asset.details.asset,
      asset.details.policyId,
      wallet_address,
      royaltiesAddress,
      royaltiesPercentage,
      newPrice,
    );
    console.log("datum", datum)

    let this_event = createEvent(
      MARKET_TYPE.NEW_LISTING,
      datum,
      txHash,
      wallet_address,
    );
    console.log("this_event", this_event);

    await addWalletEvent(wallet, this_event);




    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.details.policyId,
      listing: {
        [asset_updated.details.asset]: asset_updated,
      },
    };

    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: MARKET_TYPE.PRICE_UPDATE_SUCCESS });
  } catch (error) {
    console.error(`Unexpected error in updateToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const delistToken = (asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.details.asset);
    
    console.log(
      "delistToken on market",
      asset.details.assetName,
      asset.details.policyId,
      asset.listing.price
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.details.asset
    );

    let txHash = await cancel(
      asset.details.assetName,
      asset.details.policyId,
      asset.listing.price,
      assetUtxos
    );
    console.log("txHash", txHash);

    asset_updated.listing = {
      is_listed: false,
    };

    let event = {
      type: MARKET_TYPE.DELIST,
      on: new Date().getTime(),
      tx: txHash,
    }
    add_event_asset_history(asset_updated, event);

    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.details.policyId,
      listing: {
        [asset_updated.details.asset]: asset_updated,
      },
    };
    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: MARKET_TYPE.DELIST_SUCCESS });
  } catch (error) {
    console.error(`Unexpected error in delistToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};

export const purchaseToken = (asset, callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.details.asset);
    
    console.log(
      "purchaseToken on market",
      asset.details.assetName,
      asset.details.policyId,
      asset.listing.price
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.details.asset
    );

    let txHash = await purchase(
      asset.details.assetName,
      asset.details.policyId,
      asset.listing.addr,
      asset.listing.price,
      assetUtxos
    );
    console.log("txHash", txHash);

    asset_updated.listing = {
      is_listed: false,
    };
    
    let event = {
      type: MARKET_TYPE.PURCHASE,
      on: new Date().getTime(),
      tx: txHash,
      price: asset.listing.price
    }
    add_event_asset_history(asset_updated, event);

    if (txHash)
      await saveAsset(asset_updated);

    let output = {
      policy_id: asset.details.policyId,
      listing: {
        [asset_updated.details.asset]: asset_updated,
      },
    };
    dispatch(collections_add_tokens(output));
    dispatch(setWalletLoading(false));
    callback({ success: true, type: MARKET_TYPE.PURCHASE_SUCCESS });
  } catch (error) {
    console.error(`Unexpected error in purchaseToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};
