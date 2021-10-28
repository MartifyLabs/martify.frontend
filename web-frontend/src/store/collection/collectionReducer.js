import * as types from "./collectionTypes";
import * as walletTypes from "../wallet/walletTypes";

let collectionobj = {
  loaded: false,
  loading: false,
  collections: {},
  policies_collections: {},
  policies_tokens: {},
};

function update_tokens(token, asset_id, policy_id){
  token.id = asset_id;
  token.policy_id = policy_id;
  return token;
}

export default function collectionReducer(state = collectionobj, { type, payload }) {
  switch (type) {

    case types.COLLECTIONS_LOADED:
      var tmp_policies_collections = {...state.policies_collections};
      for(var collection_id in payload){
        tmp_policies_collections[payload[collection_id].policy_id] = collection_id;
      }
      return {
        ...state,
        loaded: true,
        collections: payload,
        policies_collections: tmp_policies_collections
      };
    case types.COLLECTIONS_LOADING:
      return {
        ...state,
        loading: payload
      };
    case types.COLLECTIONS_LISTING_LOADED:
      let tmp_collections = {
        ...state.collections,
      };
      tmp_collections[payload.collection_id].listing = payload.listing;
      return {
        ...state,
        collections: tmp_collections,
        loading: false,
      };
    
     case types.COLLECTIONS_ADD_TOKENS:
      let tmp = {
        ...state.policies_tokens,
      };
      
      let new_tokens = {...payload.listing};

      for(var asset_id in new_tokens){
        new_tokens[asset_id] = update_tokens(new_tokens[asset_id], asset_id, payload.policy_id);
      }
      if(!(payload.policy_id in tmp)){
        tmp[payload.policy_id] = {};
      }
      
      tmp[payload.policy_id] = {
        ...new_tokens
      };

      return {
        ...state,
        loading: false,
        policies_tokens: tmp
      };


    case walletTypes.SET_WALLET_ASSETS:
      let tmp_policies_tokens = {...state.policies_tokens};

      for(var policy_id in payload){
        var tmp_policies_tokens_policy = {};
        if(policy_id in tmp_policies_tokens){
          tmp_policies_tokens_policy = {...tmp_policies_tokens[policy_id]};
        }

        for(var asset_id in payload[policy_id]){
          tmp_policies_tokens_policy[asset_id] = payload[policy_id][asset_id];
        }
        
        tmp_policies_tokens[policy_id] = tmp_policies_tokens_policy;
      }
      
      return {
        ...state,
        policies_tokens: tmp_policies_tokens,
      };
    
    default:
      return state;
  }
}
