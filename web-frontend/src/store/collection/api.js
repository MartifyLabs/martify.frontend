import {
  collections_loaded,
  collections_add_tokens,
  collections_loading,
} from "./collectionActions";

import data_collections from "../../data/collections.json";
import data_assets from "../../data/assets.json";

export const load_collection = (callback) => async (dispatch) => {

  for(var collection_id in data_collections){
    var tmp = data_collections[collection_id];
    tmp.style.banner_path = `/collections/${tmp.id}/${tmp.style.banner}`;
    tmp.style.logo_path = `/collections/${tmp.id}/${tmp.style.logo}`;
    tmp.is_verified = true;
    data_collections[collection_id] = tmp;
  }

  dispatch(collections_loaded(data_collections));
  callback({data_collections});
}


export const get_listings = (policy_id, callback) => async (dispatch) => {

  // query policy ID, get data
  dispatch(collections_loading(true));
  
  let output = {
    "policy_id": policy_id,
    "listing": data_assets[policy_id]
  };
  console.log(22, policy_id)
  console.log(11, data_assets)
  if(output.policy_id && output.listing){
    dispatch(collections_add_tokens(output));
  }

  callback(true);
  
  
}

export const get_asset = (policy_id, asset_id, callback) => async (dispatch) => {

  // query, get data
  dispatch(collections_loading(true));
  
  let output = {
    "policy_id": policy_id,
    "listing": {
      [asset_id]: data_assets[policy_id][asset_id]
    }
  };
  
  if(output.policy_id && output.listing){
    dispatch(collections_add_tokens(output));
  }
  callback(true);
  
}