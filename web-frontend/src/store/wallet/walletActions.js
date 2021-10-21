import * as types from "./walletTypes";

export function walletConnected() {
  return {
    type: types.WALLET_CONNECTED,
  };
}
export function setWalletNetwork(payload) {
  return {
    type: types.SET_WALLET_NETWORK,
    payload: payload,
  };
}
export function setWalletUsedAddr(payload) {
  return {
    type: types.SET_WALLET_USEADDR,
    payload: payload,
  };
}
export function setWalletRewardAddr(payload) {
  return {
    type: types.SET_WALLET_REWARDADDR,
    payload: payload,
  };
}
export function setWalletBalance(payload) {
  return {
    type: types.SET_WALLET_BALANCE,
    payload: payload,
  };
}
export function setWalletUtxos(payload) {
  return {
    type: types.SET_WALLET_UTXOS,
    payload: payload,
  };
}

export function setWalletLoading(payload) {
  return {
    type: types.SET_WALLET_LOADING,
    payload: payload,
  };
}
