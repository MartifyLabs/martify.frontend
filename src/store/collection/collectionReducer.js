import * as types from "./collectionTypes";
import * as walletTypes from "../wallet/walletTypes";

let collectionobj = {
  loaded: false,
  loading: false,
  collections: {},
  policies_collections: {},
  policies_assets: {},
};

function update_tokens(token, policy_id, state_policies_collections){
  if(token){
    if(policy_id in state_policies_collections){
      token.collection = state_policies_collections[policy_id];
    }else{
      token.collection = {policy_id: policy_id};
    }
    token.listing = 
      token.listing ? {...token.listing} : {}
    ;
  }
  return token;
}

function add_assets(state, payload){
  var tmp_policies_assets = {...state.policies_assets};

  for(var asset_id in payload.assets){
    var this_asset = payload.assets[asset_id];
    var policy_id = this_asset.details.policyId;

    var tmp_policies_assets_policy = {};
    if(policy_id in tmp_policies_assets){
      tmp_policies_assets_policy = {...tmp_policies_assets[policy_id]};
    }

    this_asset = update_tokens(this_asset, policy_id, state.policies_collections);
    tmp_policies_assets_policy[asset_id] = this_asset;
    tmp_policies_assets[policy_id] = tmp_policies_assets_policy;
  }

  return {
    ...state,
    policies_assets: tmp_policies_assets,
  };
}

export default function collectionReducer(state = collectionobj, { type, payload }) {
  switch (type) {

    case types.COLLECTIONS_LOADED:
      var tmp_policies_collections = {...state.policies_collections};
      var tmp_collections = {...state.collections};

      for(var collection_id in payload){
        tmp_collections[collection_id] = payload[collection_id]
        for(var i in payload[collection_id].policy_ids){
          var policy_id = payload[collection_id].policy_ids[i];
          tmp_policies_collections[policy_id] = payload[collection_id];
        }
      }
      return {
        ...state,
        loaded: true,
        loading: false,
        collections: tmp_collections,
        policies_collections: tmp_policies_collections
      };
      
    case types.COLLECTIONS_LOADING:
      return {
        ...state,
        loading: payload
      };
    case types.COLLECTIONS_LISTING_LOADED:
      var tmp_collections = {
        ...state.collections,
      };
      tmp_collections[payload.collection_id].listing = payload.listing;
      return {
        ...state,
        collections: tmp_collections,
        loading: false,
      };
    
     case types.COLLECTIONS_ADD_TOKENS:
      var tmp = {
        ...state.policies_assets,
      };
      
      var new_tokens = {...payload.listing};

      for(var asset_id in new_tokens){
        new_tokens[asset_id] = update_tokens(new_tokens[asset_id], payload.policy_id, state.policies_collections);
      }

      if(!(payload.policy_id in tmp)){
        tmp[payload.policy_id] = {};
      }
      
      tmp[payload.policy_id] = {
        ...tmp[payload.policy_id],
        ...new_tokens
      };

      return {
        ...state,
        loading: false,
        policies_assets: tmp
      };

    // case walletTypes.SET_WALLET_ASSETS:
    //   var tmp_policies_assets = {...state.policies_assets};

    //   for(var asset_id in payload){
    //     if(asset_id!='lovelace'){
    //       var this_asset = payload[asset_id];
    //       if(this_asset){
    //         var policy_id = this_asset.details.policyId;

    //         var tmp_policies_assets_policy = {};
    //         if(policy_id in tmp_policies_assets){
    //           tmp_policies_assets_policy = {...tmp_policies_assets[policy_id]};
    //         }
  
    //         this_asset = update_tokens(this_asset, policy_id, state.policies_collections);
    //         tmp_policies_assets_policy[asset_id] = this_asset;
    //         tmp_policies_assets[policy_id] = tmp_policies_assets_policy;
    //       }
    //     }
    //   }

    //   return {
    //     ...state,
    //     policies_assets: tmp_policies_assets,
    //   };

    case walletTypes.SET_WALLET_DATA:
      return add_assets(state, payload)
    
    case types.COLLECTIONS_ADD_ASSETS:
      return add_assets(state, payload)

    default:
      return state;
  }
}
