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

    // case types.SET_WALLET_ASSETS:
    //   let tmp_assets = {...state.assets};

    //   for(var policy_id in payload){
    //     var tmp_assets_policy = [];
    //     if(policy_id in tmp_assets){
    //       tmp_assets_policy = [...tmp_assets[policy_id]];
    //     }

    //     for(var asset_id in payload[policy_id]){
    //     //   tmp_assets_policy[asset_id] = payload[policy_id][asset_id];
    //       if(!(tmp_assets_policy.includes(asset_id))){
    //         tmp_assets_policy.push(asset_id);
    //       }
    //     }
        
    //     tmp_assets[policy_id] = tmp_assets_policy;
    //   }
      
    //   return {
    //     ...state,
    //     assets: tmp_assets,
    //     loaded_assets: true,
    //   };

    case types.SET_WALLET_ASSETS:
      let tmp_assets = {};
      for(var asset_id in payload){
        if(asset_id!='lovelace'){
          let this_asset = payload[asset_id];
          tmp_assets[asset_id] = {
            policy_id: this_asset.info.policyId,
            quantity: this_asset.quantity,
            asset_id: asset_id,
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
