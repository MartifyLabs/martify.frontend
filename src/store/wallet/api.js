import cbor from "cbor";
import Cardano from "../../cardano/serialization-lib";
import {
  getBalance,
  getNetworkId,
  getOwnedAssets,
  getUtxos,
  signTx,
  getUsedAddress,
  getCollateral,
} from "../../cardano/wallet";

import { saveAssets } from "../../database";
import { getAssets } from "../../database/assets";

import { WALLET_STATE } from "./walletTypes";

import {
  walletConnected,
  // setWalletNetwork,
  // setWalletUsedAddr,
  // setWalletRewardAddr,
  // setWalletBalance,
  // setWalletUtxos,
  setWalletLoading,
  setWalletAssets,
} from "./walletActions";

import { api_host, nami_network } from "../../config";

/////////

const convertCbor = (txRaw) => {
  const decoded = cbor.decode(txRaw);
  decoded.splice(1, 1, new Map());
  return Buffer.from(cbor.encode(decoded), "hex").toString("hex");
};

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

function receive_txn_for_user_sign(res, callback) {
  let cbor_from_tx = res["txhash"];
  // let address = res["address"];

  var convertedcborHex = convertCbor(cbor_from_tx);

  signTx(convertedcborHex)
    .then((signedTx) => {
      const decoded_complete = cbor.decode(convertedcborHex);
      const decoded_signed = cbor.decode(signedTx);
      decoded_complete.splice(1, 1, decoded_signed);
      const encoded_final = cbor.encode(decoded_complete);
      const submitTx = buf2hex(encoded_final);

      submitTx(submitTx)
        .then((txn) => {
          // TODO: after successful payment, do what?
          callback({ success: true, txn: txn });
        })
        .catch((error) => {
          console.log(error);
          callback({ success: false, error: error });
        });
    })
    .catch((error) => {
      console.log(error);
      callback({ success: false, error: error });
    });
}

/////////

export const connectWallet = (current_wallet, is_silent, callback) => async (dispatch) => {
  try {
    // console.log(current_wallet);
    if(!is_silent) dispatch(setWalletLoading(WALLET_STATE.CONNECTING));

    window.cardano
      .enable()
      .then((res) => {
        Cardano.load().then(() => {
          console.log("cardano-serialization-lib Loaded.");
        });

        getNetworkId().then((network) => {
          let connected_wallet = {};

          connected_wallet.network = network;

          if(nami_network === network){
            getUtxos().then((res_utxos) => {
              connected_wallet.utxos = res_utxos;

              // console.log(current_wallet.data.utxos)
              // if(current_wallet.data.utxos){
              //   if(connected_wallet.utxos.sort().join(',')=== current_wallet.data.utxos.sort().join(',')){
              //     console.log("SAME!!!");
              //   }else{
              //     console.log("NOT SAME do something");
              //   }
              // }else{
              //   console.log("NOT SAME do something 2");
              // }
  
              window.cardano.getUsedAddresses().then((res) => {
                let used_address = res[0];
                connected_wallet.used_addr = used_address;
  
                getCollateral().then((resCollateral) => {
                  connected_wallet.collateral = resCollateral;
  
                  getUsedAddress().then((res_walletaddr) => {
                    connected_wallet.wallet_address = res_walletaddr.to_bech32();
  
                    getBalance().then((res) => {
                      const balance = cbor.decode(res);
  
                      let wallet_balance = 0;
                      if (Number.isInteger(balance)) {
                        wallet_balance = balance;
                      } else {
                        for (let i in balance) {
                          if (Number.isInteger(balance[i])) {
                            wallet_balance = balance[i];
                            break;
                          }
                        }
                      }
  
                      connected_wallet.wallet_balance = wallet_balance;
  
                      dispatch(walletConnected(connected_wallet));
  
                      callback({
                        success: true,
                        data: connected_wallet,
                      });

                    });
                  });
                });
              });
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
        });

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

export const buyer_pay = (send_addr, callback) => async (dispatch) => {
  try {
    window.cardano.enable().then((namiIsEnabled) => {
      if (namiIsEnabled && send_addr) {
        fetch(api_host + "/buyer_pay", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: send_addr,
          }),
        })
          .then((res) => res.json())
          .then(
            (res) => {
              console.log(res);
            },
            (error) => {
              console.log(error);
            }
          );
      }
    });
  } catch (err) {
    console.log({ err });
    callback({ success: false, error: err });
  }
};

export const create_txn = (send_addr, amount, callback) => async (dispatch) => {
  try {
    window.cardano.enable().then((namiIsEnabled) => {
      if (namiIsEnabled && send_addr && amount >= 2) {
        fetch(api_host + "/create_txn", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: send_addr,
            amount: amount,
          }),
        })
          .then((res) => res.json())
          .then(
            (res) => {
              receive_txn_for_user_sign(res, callback);
            },
            (error) => {
              console.log(error);
            }
          );
      }
    });
  } catch (err) {
    console.log({ err });
    callback({ success: false, error: err });
  }
};

export const get_wallet_assets = (callback) => async (dispatch) => {
  console.log("getting wallet assets", WALLET_STATE.GETTING_ASSETS);
  dispatch(setWalletLoading(WALLET_STATE.GETTING_ASSETS));

  const wallet_assets = await getAssets(await getOwnedAssets());
  console.log("gotten wallet_assets", wallet_assets);

  var list_assets = Object.keys(wallet_assets).map(function (key) {
    return wallet_assets[key].info ? wallet_assets[key].info : false;
  });

  await saveAssets(list_assets);

  dispatch(setWalletAssets(wallet_assets));
  callback({ success: true, assets: wallet_assets });
};
