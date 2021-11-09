import {
  collections_loaded,
  collections_add_tokens,
  collections_loading,
} from "./collectionActions";

import data_collections from "../../data/collections.json";
import data_collections_cnft from "../../data/collections-cnft.json";

import {
  getAssets,
  getAsset,
  saveAsset,
} from "../../database";

import { getWalletAddresses } from "../../cardano/wallet";

export const load_collection = (callback) => async (dispatch) => {

  let all_collections = {};

  for(var collection_id in data_collections){
    var tmp = data_collections[collection_id];
    tmp.is_martify_verified = true;

    if(tmp.style){
      if(tmp.style.banner) tmp.style.banner_path = `/images/collections/${tmp.id}/${tmp.style.banner}`;
      if(tmp.style.logo) tmp.style.logo_path = `/images/collections/${tmp.id}/${tmp.style.logo}`;
    }
    all_collections[collection_id] = tmp;
  }

  for(var collection_id in data_collections_cnft){
    var tmp = data_collections_cnft[collection_id];
    if(tmp.id in all_collections){
      all_collections[tmp.id].policy_id = [...all_collections[tmp.id].policy_id, ...tmp.policy_id];
    }else{
      tmp.is_cnft_verified = true;
      all_collections[collection_id] = tmp;
    }
    
  }

  dispatch(collections_loaded(all_collections));
  callback({all_collections});
}

export const get_listings = (policy_id, callback) => async (dispatch) => {

  dispatch(collections_loading(true));

  let output = {
    "policy_id": policy_id,
    "listing": {}
  };

  let policyids_projectid = {}
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
