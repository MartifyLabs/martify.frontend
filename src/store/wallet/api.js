import Cardano from "../../cardano/serialization-lib";
import {
  getNetworkId,
  getOwnedAssets,
  getUsedAddress,
  getCollateral,
} from "../../cardano/wallet";

import { getAssets } from "../../database/assets";
import { getWallet, setWalletAssets } from "../../database/wallets";
import { WALLET_STATE } from "./walletTypes";

import {
  walletConnected,
  setWalletLoading,
  setWalletData,
} from "./walletActions";

import { nami_network } from "../../config";


export const connectWallet = (current_wallet, is_silent, callback) => async (dispatch) => {
  try {
    if(!is_silent) dispatch(setWalletLoading(WALLET_STATE.CONNECTING));

    window.cardano
      .enable()
      .then(async (res) => {

        Cardano.load().then(() => {
          console.log("cardano-serialization-lib Loaded.");
        });

        let network = await getNetworkId();
          
        if(nami_network === network){

          let connected_wallet = {
            nami: {},
            data: {}
          };
          connected_wallet.nami.network = network;

          let wallet_address = await getUsedAddress();

          let this_wallet = await getWallet(wallet_address);
          connected_wallet.data = this_wallet;

          connected_wallet.nami.collateral = await getCollateral();
    
          dispatch(walletConnected(connected_wallet));

          callback({
            success: true,
            data: connected_wallet,
          });
        }
        // if network not correct
        else{
          dispatch(setWalletLoading(false));
          callback({
            success: false,
            msg: "Switch your Nami Wallet network."
          });
        }
        

        // window.cardano.getUnusedAddresses().then((res) => {
        // })

        // window.cardano.getRewardAddress().then((res) => {
        //   dispatch(setWalletRewardAddr(res));
        // })
      })
      .catch((error) => {
        console.log("ERROR connectWallet", error);
        dispatch(setWalletLoading(false));
        callback({ success: false, error: error });
      });
  } catch (err) {
    dispatch(setWalletLoading(false));
    callback({ success: false, error: err });
  }
};

export const get_wallet_assets = (callback) => async (dispatch) => {
  // console.log("getting wallet assets", WALLET_STATE.GETTING_ASSETS);
  dispatch(setWalletLoading(WALLET_STATE.GETTING_ASSETS));

  let wallet_assets = await getAssets(await getOwnedAssets());
  wallet_assets = wallet_assets.filter((asset) => {
    return asset!==undefined
  })
  .map((asset) => asset);
  // console.log("gotten wallet_assets", wallet_assets);

  let assets = {};
  for(var i in wallet_assets){
    let asset = wallet_assets[i];
    assets[asset.details.asset] = asset;
  }

  let wallet_address = await getUsedAddress();
  let wallet = await getWallet(wallet_address);
  // console.log("wallet", wallet)
  // for(var asset in wallet.assets){
  //   let this_asset = wallet.assets[asset];
  //   if(this_asset.status.locked){
  //     assets[asset] = this_asset;
  //   }
  // }
  // console.log("assets", assets)
  let updated_wallet = await setWalletAssets(wallet, assets);
  // console.log("updated_wallet", updated_wallet);
  dispatch(setWalletData(updated_wallet));

  // var list_assets = Object.keys(wallet_assets).map(function (key) {
  //   if(wallet_assets[key]){
  //     return wallet_assets[key]
  //   }
  //   return false;
  // });

  // let wallet_assets_dictionary = {};
  // for(var i in wallet_assets){
  //   var this_asset = wallet_assets[i];
  //   if(this_asset){
  //     wallet_assets_dictionary[this_asset.details.asset] = this_asset;
  //   }
  // }
  
  // await saveAssets(list_assets);

  // dispatch(setWalletAssets(wallet_assets_dictionary));
  // callback({ success: true, assets: wallet_assets_dictionary });
  callback({ success: true });
};
