import * as types from "./walletTypes";

let walletobj = {
  connected: false,
  loading: false,
  data: {},
};

export default function walletReducer(state = walletobj, { type, payload }) {
  switch (type) {

    case types.WALLET_CONNECTED:
      return {
        ...state,
        connected: true,
        loading: false
      };
    
    case types.SET_WALLET_LOADING:
      return {
        ...state,
        loading: payload,
      };
    
    case types.SET_WALLET_NETWORK:
      return {
        ...state,
        data: {
          ...state.data,
          network: payload,
        },
      };
    
    case types.SET_WALLET_USEADDR:
      return {
        ...state,
        data: {
          ...state.data,
          used_addr: payload,
        },
      };
    
    case types.SET_WALLET_REWARDADDR:
      return {
        ...state,
        data: {
          ...state.data,
          reward_addr: payload,
        },
      };

    case types.SET_WALLET_BALANCE:
      return {
        ...state,
        data: {
          ...state.data,
          balance: payload,
        },
      };
    case types.SET_WALLET_UTXOS:
      return {
        ...state,
        data: {
          ...state.data,
          utxos: payload,
        },
      };

    default:
      return state;
  }
}
