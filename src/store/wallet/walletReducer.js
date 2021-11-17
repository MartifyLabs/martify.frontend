import * as types from "./walletTypes";

let walletobj = {
  connected: false,
  loading: false,
  data: {},
  assets: {},
  loaded_assets: false,
};

export default function walletReducer(state = walletobj, { type, payload }) {
  switch (type) {

    case types.WALLET_CONNECTED:
      return {
        ...state,
        connected: true,
        loading: false,
        data: payload
      };
    
    case types.SET_WALLET_LOADING:
      return {
        ...state,
        loading: payload,
      };
    
    case types.SET_WALLET_ASSETS:
      let tmp_assets = {};
      for(var asset_id in payload){
        if(asset_id!='lovelace'){
          let this_asset = payload[asset_id];
          if(this_asset.info){
            tmp_assets[asset_id] = {
              policy_id: this_asset.info.policyId,
              quantity: this_asset.quantity,
              asset_id: asset_id,
            }
          }
        }
      }
      return {
        ...state,
        assets: tmp_assets,
        loaded_assets: true,
        loading: false,
      };
      
    default:
      return state;
  }
}
