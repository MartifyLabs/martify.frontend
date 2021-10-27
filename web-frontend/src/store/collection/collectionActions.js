import * as types from "./collectionTypes";

export function collections_loaded(payload) {
  return {
    type: types.COLLECTIONS_LOADED,
    payload: payload,
  };
}
export function collections_add_tokens(payload) {
  return {
    type: types.COLLECTIONS_ADD_TOKENS,
    payload: payload,
  };
}
export function collections_loading(payload) {
  return {
    type: types.COLLECTIONS_LOADING,
    payload: payload,
  };
}
