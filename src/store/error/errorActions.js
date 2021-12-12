import * as types from "./errorTypes";

export function set_error(payload) {
  return {
    type: types.SET_ERROR,
    payload: payload,
  };
}
export function clear_error() {
  return {
    type: types.CLEAR_ERROR
  };
}
