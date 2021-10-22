import cbor from "cbor";

import {
  walletConnected,
  setWalletNetwork,
  setWalletUsedAddr,
  // setWalletRewardAddr,
  setWalletBalance,
  setWalletUtxos,
  setWalletLoading,
} from "./walletActions";

import { api_host } from "../../config";

/////////

const convertCbor = (txRaw) => {
  const decoded = cbor.decode(txRaw);
  decoded.splice(1, 1, new Map());
  return Buffer.from(cbor.encode(decoded), "hex").toString("hex");
};

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
}

function receive_txn_for_user_sign(res, callback){

  let cbor_from_tx = res["txhash"];
  // let address = res["address"];

  var convertedcborHex = convertCbor(cbor_from_tx);

  window.cardano.signTx(convertedcborHex).then((signedTx) => {
    
    const decoded_complete = cbor.decode(convertedcborHex);
    const decoded_signed=cbor.decode(signedTx);
    decoded_complete.splice(1, 1, decoded_signed);
    const encoded_final=cbor.encode(decoded_complete);
    const submitTx=buf2hex(encoded_final);

    window.cardano.submitTx(submitTx).then((txn) => {
      // TODO: after successful payment, do what?
      callback({ success: true, txn: txn});
    })
    .catch(error => {
      console.log(error);
      callback({ success: false, error: error});
    });

  })
  .catch(error => {
    console.log(error);
    callback({ success: false, error: error});
  });

}

/////////

export const connectWallet = (callback) => async (dispatch) => {
  try {
    
    dispatch(setWalletLoading(true));

    window.cardano.enable().then((res) => {

      window.cardano.getNetworkId().then((network) => {
        // console.log("getNetworkId", network); 
        dispatch(setWalletNetwork(network));

        window.cardano.getUtxos().then((res_utxos) => {

          dispatch(setWalletUtxos(res_utxos));

          window.cardano.getUsedAddresses().then((res) => {

            let used_address = res[0];
            dispatch(setWalletUsedAddr(used_address));

            window.cardano.getBalance().then((res) => {
              const balance = cbor.decode(res);
              // console.log("balance", balance);

              let wallet_balance = 0;
              if(Number.isInteger(balance)){
                wallet_balance = balance;
              }else{
                for(let i in balance){
                  if(Number.isInteger(balance[i])){
                    wallet_balance = balance[i];
                    break;
                  }
                }
              }

              dispatch(setWalletBalance(wallet_balance));

              dispatch(walletConnected());
              
              callback({
                success: true, 
                data: {
                  used_addr: used_address,
                  network: network,
                  wallet_balance: wallet_balance,
                  utxos: res_utxos
                }
              });

            });
          });
        });
      });

      // window.cardano.getUnusedAddresses().then((res) => {
      // })

      // window.cardano.getRewardAddress().then((res) => {
      //   dispatch(setWalletRewardAddr(res));
      // })

    })
    .catch(error => {
      console.log("ERROR connectWallet", error);
      dispatch(setWalletLoading(false));
      callback({ success: false, error: error });
    });

  } catch (err) {
    dispatch(setWalletLoading(false));
    callback({ success: false, error: err });
  }

};


export const create_txn = (send_addr, amount, callback) => async (dispatch) => {
  try {

    window.cardano.enable().then((namiIsEnabled) => {

      if (namiIsEnabled && send_addr && amount >= 2) {

        fetch(api_host+'/create_txn', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: send_addr,
            amount: amount,
          })
        })
        .then(res => res.json())
        .then((res) => {
          receive_txn_for_user_sign(res, callback);
        },
        (error) => {
          console.log(error)
        })

      }
    })
  } catch (err) {
    console.log({ err });
    callback({ success: false, error: err });
  }
};
