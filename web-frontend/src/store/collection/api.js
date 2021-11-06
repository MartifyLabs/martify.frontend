import {
  collections_loaded,
  collections_add_tokens,
  collections_loading,
} from "./collectionActions";

import data_collections from "../../data/collections.json";

import {
  getAssets,
  getAsset,
  saveAsset,
} from "../../database";

import { getWalletAddresses } from "../../cardano/wallet";

export const load_collection = (callback) => async (dispatch) => {

  for(var collection_id in data_collections){
    var tmp = data_collections[collection_id];
    tmp.style.banner_path = `/images/collections/${tmp.id}/${tmp.style.banner}`;
    tmp.style.logo_path = `/images/collections/${tmp.id}/${tmp.style.logo}`;
    tmp.is_verified = true;
    data_collections[collection_id] = tmp;
  }

  dispatch(collections_loaded(data_collections));
  callback({data_collections});
}

export const get_listings = (policy_id, callback) => async (dispatch) => {

  dispatch(collections_loading(true));

  let output = {
    "policy_id": policy_id,
    "listing": {}
  };

  let assets = await getAssets(policy_id);
  for(var i in assets){
    let asset = assets[i];
    output.listing[asset.info.asset] = asset;
  }
  
  if(output.policy_id && output.listing){
    dispatch(collections_add_tokens(output));
  }

  callback(true);
}

function add_token(asset, dispatch){
  let output = {
    "policy_id": asset.info.policyId,
    "listing": {
      [asset.info.asset]: asset
    }
  };
  dispatch(collections_add_tokens(output));
}

export const get_asset = (policy_id, asset_id, callback) => async (dispatch) => {

  dispatch(collections_loading(true));
  
  let asset = await getAsset(asset_id);

  if(asset) add_token(asset, dispatch);
  callback(true);
}


export const asset_add_offer = (asset_id, price, callback) => async (dispatch) => {
  let asset = await getAsset(asset_id);

  let wallet_address = await getWalletAddresses();

  if(!("offers" in asset)){
    asset.offers = {};
  }

  let offer = {
    t: new Date().getTime(),
    p: price,
  }

  asset.offers[wallet_address] = offer;
  
  await saveAsset(asset);

  add_token(asset, dispatch)

  callback(true);
}
