import {
  collections_loaded,
  collections_add_tokens,
  collections_loading,
} from "./collectionActions";

import data_collections from "../../data/collections.json";
import data_assets from "../../data/assets.json";

import {
  getAssets,
  getAsset,
} from "../../database";

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
  
  // let output = {
  //   "policy_id": policy_id,
  //   "listing": data_assets[policy_id]
  // };
  // console.log(22, data_assets[policy_id])
  
  if(output.policy_id && output.listing){
    dispatch(collections_add_tokens(output));
  }

  callback(true);
  
}

export const get_asset = (policy_id, asset_id, callback) => async (dispatch) => {

  dispatch(collections_loading(true));
  
  let output = {
    "policy_id": policy_id,
    "listing": {}
  };

  let asset = await getAsset(asset_id);

  // output.listing[asset_id] = data_assets[policy_id][asset_id] ? data_assets[policy_id][asset_id] : false;
  if(asset) output.listing[asset_id] = asset;
  else output.listing[asset_id] = false;
  
  if(output.policy_id && output.listing){
    dispatch(collections_add_tokens(output));
  }
  callback(true);
}
