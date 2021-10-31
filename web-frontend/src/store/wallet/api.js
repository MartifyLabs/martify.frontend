import cbor from "cbor";
import { getWalletAssets } from "../../cardano/transaction";

import {
  walletConnected,
  setWalletNetwork,
  setWalletUsedAddr,
  // setWalletRewardAddr,
  setWalletBalance,
  setWalletUtxos,
  setWalletLoading,
  setWalletAssets,
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


export const buyer_pay = (send_addr, callback) => async (dispatch) => {
  try {

    window.cardano.enable().then((namiIsEnabled) => {

      if (namiIsEnabled && send_addr) {

        fetch(api_host+'/buyer_pay', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: send_addr,
          })
        })
        .then(res => res.json())
        .then((res) => {
          console.log(res)
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

export const get_wallet_assets = (callback) => async (dispatch) => {
  
  dispatch(setWalletLoading(true));

  const wallet_assets = await getWalletAssets();
  console.log(wallet_assets);

  // dispatch(setWalletAssets(wallet_assets));
  // callback({ success: true, wallet_assets: wallet_assets });

  // mock for now

  let assets = [
    {
      asset:
        "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303031",
      asset_name: "506978656c48656164303031",
      fingerprint: "asset10n6n9czytzh2ud75ykzhq62wagdsxl7fcawdtu",
      initial_mint_tx_hash:
        "060b38cf123462f0287c28bcd8a6854212e491cc717b421f86a72fb3ef7aedd2",
      metadata: null,
      mint_or_burn_count: 1,
      onchain_metadata: {
        "creature name": "Skull Kid",
        image: "Qmc5apNaFzRunLcnn6FCemp5jpxyMV6DBzRJwrvm2M4yjA",
        mediaType: "image/gif",
        name: "PixelHead #001",
        narrative: [
          "A pale shadow looms over the Earth. As the fourth seal was",
          "broken, authority was given to him to kill with sword, and",
          "famine, and plague, and by the wild animals of the earth. Could",
          "he be an advent to more calamities?",
          "---",
          "The Pixel Head Squad",
        ],
        policy_id: "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b",
        quantity: "1",
      },
    },
    {
      asset:
        "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303131",
      asset_name: "506978656c48656164303131",
      fingerprint: "asset1qhd82jlnveszv92s57g84y4dx9f6pgzt79pxh9",
      initial_mint_tx_hash:
        "5d582f6614fdbb74057d010f0174833a0e4af8c0d1ae64b793bbd0ea0cd8e215",
      metadata: null,
      mint_or_burn_count: 6,
      onchain_metadata: {
        "creature name": "Loafing",
        image: "QmaXCeBT6BgHrNEjnkhgEzvAChMAHYCARdPbn3vhoCLXJC",
        mediaType: "image/gif",
        name: "PixelHead #011",
        narrative: [
          "You may think he is just a regular old chap, wait till you see",
          "what he can reel in.",
          "-",
          "The Pixel Head Squad",
        ],
        policy_id: "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b",
        quantity: "6",
      },
    },
  ];

  let wallet_assets_by_policy = {};
  for (var i in assets) {
    let this_asset = assets[i];
    let policy_id = this_asset.onchain_metadata.policy_id;

    if (!(policy_id in wallet_assets_by_policy)) {
      wallet_assets_by_policy[policy_id] = {};
    }

    let asset = {};
    asset.meta = this_asset.onchain_metadata;
    asset.id = this_asset.asset;
    asset.policy_id = policy_id;

    wallet_assets_by_policy[policy_id][this_asset.asset] = asset;
  }

  dispatch(setWalletAssets(wallet_assets_by_policy));
  callback({ success: true, assets: assets });
};