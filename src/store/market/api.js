import { offer, update, cancel, purchase } from "../../cardano/market-contract/";
import { getUsedAddress } from "../../cardano/wallet";
import { contractAddress } from "../../cardano/market-contract/validator";
import { getLockedUtxosByAsset } from "../../cardano/blockfrost-api";

import { getWallet, addWalletEvent } from "../../database/wallets";
import { saveAsset, getAsset, lockAsset, unlockAsset } from "../../database/assets";

import { collections_add_tokens } from "../collection/collectionActions";
import { setWalletLoading } from "../wallet/walletActions";
import { WALLET_STATE } from "../wallet/walletTypes";
import { MARKET_TYPE } from "./marketTypes";
import { createEvent, createDatum } from "../../utils/factory";
import { toLovelace } from "../../utils";

function add_event_asset_history(asset, event){
  if(!("history" in asset)) asset.history = [];  
  asset.history.push(event);
}

export const listToken = (asset, price, callback) => async (dispatch) => {
  try {
    // note: if price == 0, means user wanna delist it
    dispatch(setWalletLoading(WALLET_STATE.AWAITING_SIGNATURE));

    let asset_updated = await getAsset(asset.details.asset);

    let wallet_address = (await getUsedAddress()).to_bech32();
    let royaltiesAddress = wallet_address; // TODO, got no royalties now
    let royaltiesPercentage = 0;

    let datum = createDatum(
      asset.details.assetName,
      asset.details.policyId,
      wallet_address,
      royaltiesAddress,
      royaltiesPercentage,
      price,
    );
    console.log("datum", datum)

    let offer_obj = await offer(
      datum.tn,
      datum.cs,
      datum.price
    );
    console.log("offer_obj", offer_obj);

    if (offer_obj){

      let wallet = await getWallet(wallet_address);
      
      let this_event = createEvent(
        MARKET_TYPE.NEW_LISTING,
        datum,
        offer_obj.txHash,
        wallet_address,
      );
      await addWalletEvent(wallet, this_event);
      console.log("this_event", this_event);

      asset_updated = await lockAsset(
        asset_updated,
        {
          datum: datum,
          datumHash: offer_obj.datumHash,
          txHash: offer_obj.txHash,
          address: wallet_address,
        }
      );

      let output = {
        policy_id: asset.details.policyId,
        listing: {
          [asset_updated.details.asset]: asset_updated,
        },
      };
      
      dispatch(collections_add_tokens(output));
    }

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
      asset.status.datum.tn,
      asset.status.datum.cs,
      asset.status.datum.price,
      newPrice
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.details.asset
    );

    let wallet_address = (await getUsedAddress()).to_bech32();
    let royaltiesAddress = wallet_address;
    let royaltiesPercentage = 0;

    let datum = createDatum(
      asset.details.assetName,
      asset.details.policyId,
      wallet_address,
      royaltiesAddress,
      royaltiesPercentage,
      newPrice,
    );
    console.log("datum", datum)

    let offer_obj = await update(
      asset.status.datum.tn,
      asset.status.datum.cs,
      asset.status.datum.price,
      datum.price,
      assetUtxos
    );
    console.log("offer_obj", offer_obj);

    if (offer_obj){

      let wallet = await getWallet(wallet_address);
      console.log("wallet", wallet);

      let this_event = createEvent(
        MARKET_TYPE.PRICE_UPDATE,
        datum,
        offer_obj.txHash,
        wallet_address,
      );
      console.log("this_event", this_event);
  
      await addWalletEvent(wallet, this_event);

      asset_updated = await lockAsset(
        asset_updated,
        {
          datum: datum,
          datumHash: offer_obj.datumHash,
          txHash: offer_obj.txHash,
          address: wallet_address,
        }
      );
      
      let output = {
        policy_id: asset.details.policyId,
        listing: {
          [asset_updated.details.asset]: asset_updated,
        },
      };
  
      dispatch(collections_add_tokens(output));
    }
    
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
      asset.status.datum.tn,
      asset.status.datum.cs,
      asset.status.datum.price,
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.details.asset
    );

    let txHash = await cancel(
      asset.status.datum.tn,
      asset.status.datum.cs,
      asset.status.datum.price,
      assetUtxos
    );
    console.log("txHash", txHash);

    if (txHash){
      let wallet_address = (await getUsedAddress()).to_bech32();
      let wallet = await getWallet(wallet_address);

      asset_updated = await unlockAsset(
        asset_updated,
        {
          txHash: txHash,
          address: wallet_address,
        }
      );

      let this_event = createEvent(
        MARKET_TYPE.DELIST,
        {},
        txHash,
        wallet_address,
      );
      console.log("this_event", this_event);
  
      await addWalletEvent(wallet, this_event);

      let output = {
        policy_id: asset.details.policyId,
        listing: {
          [asset_updated.details.asset]: asset_updated,
        },
      };
  
      dispatch(collections_add_tokens(output));
    }
    
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
      asset.status.datum.tn,
      asset.status.datum.cs,
      asset.status.datum.sa,
      asset.status.datum.price,
    );

    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      asset.details.asset
    );

    let txHash = await purchase(
      asset.status.datum.tn,
      asset.status.datum.cs,
      asset.status.datum.sa,
      asset.status.datum.price,
      assetUtxos
    );
    console.log("txHash", txHash);

    if (txHash){
      let wallet_address = (await getUsedAddress()).to_bech32();
      let wallet = await getWallet(wallet_address);
      
      asset_updated = await unlockAsset(
        asset_updated,
        {
          txHash: txHash,
          address: wallet_address,
        }
      );

      let this_event = createEvent(
        MARKET_TYPE.PURCHASE,
        {},
        txHash,
        wallet_address,
      );
      await addWalletEvent(wallet, this_event);
      console.log("this_event", this_event);

      let output = {
        policy_id: asset.details.policyId,
        listing: {
          [asset_updated.details.asset]: asset_updated,
        },
      };
      dispatch(collections_add_tokens(output));

    }

    dispatch(setWalletLoading(false));
    callback({ success: true, type: MARKET_TYPE.PURCHASE_SUCCESS });
  } catch (error) {
    console.error(`Unexpected error in purchaseToken. [Message: ${error.message}]`);
    dispatch(setWalletLoading(false));
    callback({ success: false });
  }
};
