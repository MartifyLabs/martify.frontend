import cbor from "cbor";

import {
  walletConnected,
  setWalletNetwork,
  setWalletUsedAddr,
  setWalletRewardAddr,
  setWalletBalance,
  setWalletUtxos,
  setWalletLoading,
} from "./walletActions";

// import {
//   api_host,
// } from "../../config";

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

      window.cardano.getUnusedAddresses().then((res) => {
        // console.log("getUnusedAddresses", res); 
      })

      window.cardano.getRewardAddress().then((res) => {
        // console.log("getRewardAddress", res);
        dispatch(setWalletRewardAddr(res));
      })

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
