import * as types from "./collectionTypes";

let collectionobj = {
  loaded: false,
  loading: false,
  collections: {},
  policies_collections: {},
  policies_tokens: {},
};

function update_tokens(token, token_id, policy_id){
  token.token_id = token_id;
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

      for(var token_id in new_tokens){
        new_tokens[token_id] = update_tokens(new_tokens[token_id], token_id, payload.policy_id);
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
    
    default:
      return state;
  }
}
