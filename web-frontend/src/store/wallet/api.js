import cbor from "cbor";
import {
  getBalance,
  getNetworkId,
  getOwnedAssets,
  getUsedAddresses,
  getUtxos,
  signTx,
} from "../../cardano/wallet";

import {
  saveAssets
} from "../../database";

import {WALLET_STATE} from "./walletTypes";

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

import { api_host } from "../../config";

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

export const connectWallet = (callback) => async (dispatch) => {
  try {
    dispatch(setWalletLoading(WALLET_STATE.CONNECTING));

    window.cardano
      .enable()
      .then((res) => {
        getNetworkId().then((network) => {
          
          let connected_wallet = {};

          connected_wallet.network = network;

          // console.log("getNetworkId", network);
          // dispatch(setWalletNetwork(network));

          getUtxos().then((res_utxos) => {
            connected_wallet.utxos = res_utxos;
            // dispatch(setWalletUtxos(res_utxos));

            getUsedAddresses().then((res) => {
              let used_address = res[0];
              // dispatch(setWalletUsedAddr(used_address));
              connected_wallet.used_addr = used_address;

              getBalance().then((res) => {
                const balance = cbor.decode(res);
                // console.log("balance", balance);

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
                // dispatch(setWalletBalance(wallet_balance));

                dispatch(walletConnected(connected_wallet));

                callback({
                  success: true,
                  data: connected_wallet,
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

  console.log("getting wallet assets", WALLET_STATE.GETTING_ASSETS)
  dispatch(setWalletLoading(WALLET_STATE.GETTING_ASSETS));

  const wallet_assets = await getOwnedAssets();
  console.log("gotten wallet_assets", wallet_assets);


  
  // need to save `wallet_assets` into database. if this asset does not exist, store it. if it exist, just update it. in firebase, both store and update is the same concept. note, do not store `lovelace` in database

  // let my_wallet_assets = '{"lovelace":{"quantity":2708219102},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733030":{"quantity":1,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733030","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"42617457696e67733030","fingerprint":"asset18rqu0sm7a9yz8vdfttupzrm8ju6qqxd2ldjrdv","quantity":1,"initialMintTxHash":"3bbfc14be822dcf3d7274ef4af993776575a16421b26dc359a4289f6730c873d","mintOrBurnCount":1,"onchainMetadata":{"name":"Bat Wings #00","image":"??","Category":"Back","mediaType":"image/gif","description":["These are wings plucked from a creature of the dark, now you","can have your own wings! Surely you can fly with these, right?","This item is part of a Halloween 2021 treasure hunt."]},"metadata":null}},"1bf3a8ce35943920361638db5b7a6738c8c805a42d1c168f0a69057642617457696e67733030":{"quantity":1,"info":{"asset":"1bf3a8ce35943920361638db5b7a6738c8c805a42d1c168f0a69057642617457696e67733030","policyId":"1bf3a8ce35943920361638db5b7a6738c8c805a42d1c168f0a690576","assetName":"42617457696e67733030","fingerprint":"asset1ljq8tetljlzc0eyj7pvnl2h2al8hvr4yd7wrqt","quantity":1,"initialMintTxHash":"238a343a80aa0aac0bb989e7106a1474c7e2c869a3d8281ef27e123675ee4cc9","mintOrBurnCount":1,"onchainMetadata":{"name":"Bat Wings #00","image":"??","Category":"Back","mediaType":"image/gif","description":["These are wings plucked from a creature of the dark, now you","can have your own wings! Surely you can fly with these, right?","This item is part of a Halloween 2021 treasure hunt."]},"metadata":null}},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733031":{"quantity":1,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733031","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"42617457696e67733031","fingerprint":"asset15y8w9kef028ldwpydqmsksxpqwygasty3cugff","quantity":1,"initialMintTxHash":"c806c65420da12518c04c0bbdb7fcc52f4be74901864ca7802f1d42e8f41511f","mintOrBurnCount":1,"onchainMetadata":{"name":"Bat Wings #01","image":"??","Category":"Back","mediaType":"image/gif","description":["These are wings plucked from a creature of the dark, now you","can have your own wings! Surely you can fly with these, right?","This item is part of a Halloween 2021 treasure hunt."]},"metadata":null}},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733039":{"quantity":1,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733039","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"42617457696e67733039","fingerprint":"asset17zw0l7p079j0caz2j8fdsq52fc3f7f7pe2x4dq","quantity":1,"initialMintTxHash":"fe3a056b97592b4ae4283ee2b90f8427b8bcf84c95c87bcfba4ed2da4b821fa5","mintOrBurnCount":1,"onchainMetadata":{"name":"Bat Wings #09","image":"??","Category":"Back","mediaType":"image/gif","description":["These are wings plucked from a creature of the dark, now you","can have your own wings! Surely you can fly with these, right?","This item is part of a Halloween 2021 treasure hunt."]},"metadata":null}},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733034":{"quantity":4,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733034","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"42617457696e67733034","fingerprint":"asset1gglg39f2hhqdcuzjlfp9malktpdky29vqnt0cz","quantity":4,"initialMintTxHash":"1a19613aed55514efdd5d2cdd29f7e3738fefdea2b91a6abf9e2801012170b84","mintOrBurnCount":4,"onchainMetadata":{"name":"Bat Wings #04","image":"Qmb8qQujroMnXrvVyBt5hSRa5Q7sUnnznNQFn5bCJ5DtSr","category":"Back","mediaType":"image/gif","description":["These are wings plucked from a creature of the dark, now you","can have your own wings! Surely you can fly with these, right?","This item is part of a Halloween 2021 treasure hunt."],"creature name":"Bat Wings"},"metadata":null}},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c436f696e73":{"quantity":90,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c436f696e73","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"506978656c436f696e73","fingerprint":"asset1p277h67qcn2m2yrvv8ndhmfdf3zgxz05k3nf8r","quantity":1000,"initialMintTxHash":"800920c2c657a2b9170d012f73d69f54808c9eff4072309c6aac454084f1f70d","mintOrBurnCount":1,"onchainMetadata":null,"metadata":null}},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303031":{"quantity":1,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303031","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"506978656c48656164303031","fingerprint":"asset10n6n9czytzh2ud75ykzhq62wagdsxl7fcawdtu","quantity":1,"initialMintTxHash":"060b38cf123462f0287c28bcd8a6854212e491cc717b421f86a72fb3ef7aedd2","mintOrBurnCount":1,"onchainMetadata":{"name":"PixelHead #001","image":"Qmc5apNaFzRunLcnn6FCemp5jpxyMV6DBzRJwrvm2M4yjA","files":[{"src":["data:text/html;base64,PGh0bWw+PGhlYWQ+PC9oZWFkPjxib2R5IG1hcmdpbn","dpZHRoPSIwIiBtYXJnaW5oZWlnaHQ9IjAiPjxpbWcgaWQ9InoiIHNyYz0iaHR0cH","M6Ly9pbmZ1cmEtaXBmcy5pby9pcGZzL1FtYzVhcE5hRnpSdW5MY25uNkZDZW1wNW","pweHlNVjZEQnpSSndydm0yTTR5akEiIHN0eWxlPSJkaXNwbGF5OmJsb2NrO21hcm","dpbjphdXRvO21heC13aWR0aDoxMDB2dzttYXgtaGVpZ2h0OjEwMHZoO3dpZHRoOm","F1dG87aGVpZ2h0OmF1dG87Ii8+PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcH","QiPno9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3onKTt1PSJodHRwczovL2luZn","VyYS1pcGZzLmlvL2lwZnMvIjtzPVsiUW1jNWFwTmFGelJ1bkxjbm42RkNlbXA1an","B4eU1WNkRCelJKd3J2bTJNNHlqQSIsIlFtV3dHaWNoOHJ1dWFMQlZuVFU4WUhaWH","k2REp2a3BHN2dZNGtCZVlhVFE0M24iLCJRbWJpalltTmppcUVjYnpGWU5zWW1nVV","FSNWZKb2VMaDJnemVvdUx6NW9MVDkxIl07bT1uZXcgRGF0ZSgpLmdldE1vbnRoKC","krMTtkPW5ldyBEYXRlKCkuZ2V0RGF0ZSgpO2g9bmV3IERhdGUoKS5nZXRIb3Vycy","gpO2Z1bmN0aW9uIGYoaSl7ei5zcmM9dStzW2ldO31pZihoPj0xOSYmaDw9MjApe2","YoMSl9aWYobT09NiYmKGQ+PTcmJmQ8PTgpKXtmKDIpfTwvc2NyaXB0PjwvYm9keT","48L2h0bWw+"],"mediaType":"text/html"}],"mediaType":"image/gif","narrative":["A pale shadow looms over the Earth. As the fourth seal was","broken, authority was given to him to kill with sword, and","famine, and plague, and by the wild animals of the earth. Could","he be an advent to more calamities?","---","The Pixel Head Squad"],"creature name":"Skull Kid"},"metadata":null}},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303131":{"quantity":1,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303131","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"506978656c48656164303131","fingerprint":"asset1qhd82jlnveszv92s57g84y4dx9f6pgzt79pxh9","quantity":6,"initialMintTxHash":"5d582f6614fdbb74057d010f0174833a0e4af8c0d1ae64b793bbd0ea0cd8e215","mintOrBurnCount":6,"onchainMetadata":{"name":"PixelHead #011","image":"QmaXCeBT6BgHrNEjnkhgEzvAChMAHYCARdPbn3vhoCLXJC","files":[{"src":["data:text/html;base64,PGh0bWw+PGhlYWQ+PC9oZWFkPjxib2R5IG1hcmdpbn","dpZHRoPSIwIiBtYXJnaW5oZWlnaHQ9IjAiPjxpbWcgaWQ9InoiIHNyYz0iaHR0cH","M6Ly9pbmZ1cmEtaXBmcy5pby9pcGZzL1FtYVhDZUJUNkJnSHJORWpua2hnRXp2QU","NoTUFIWUNBUmRQYm4zdmhvQ0xYSkMiIHN0eWxlPSJkaXNwbGF5OmJsb2NrO21hcm","dpbjphdXRvO21heC13aWR0aDoxMDB2dzttYXgtaGVpZ2h0OjEwMHZoO3dpZHRoOm","F1dG87aGVpZ2h0OmF1dG87Ii8+PHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcH","QiPgp6PWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd6Jyk7CnU9Imh0dHBzOi8vaW","5mdXJhLWlwZnMuaW8vaXBmcy8iOwpzPVsiUW1hWENlQlQ2QmdIck5Fam5raGdFen","ZBQ2hNQUhZQ0FSZFBibjN2aG9DTFhKQyIsIlFtZkRITEpHYnIzbkxkZkprRDhrU0","ZZbkdhb2NTMzVEYmNkWVpibmVvalNuVGgiLCJRbVRTZUpOYzdUc0pDR2VRaGhleF","RnRVdLSE1ZRUhkbUJOQWhUQzFBZmlQdFZGIl07Cgp2YXIgaj0wOwpmdW5jdGlvbi","BmKGkpe2o9aTt6LnNyYz11K3NbaV07fQoKei5hZGRFdmVudExpc3RlbmVyKCdjbG","ljaycsIGZ1bmN0aW9uIChldmVudCkgewogIGJvdW5kcz10aGlzLmdldEJvdW5kaW","5nQ2xpZW50UmVjdCgpOwogIHZhciBsZWZ0PWJvdW5kcy5sZWZ0OwogIHZhciB0b3","A9Ym91bmRzLnRvcDsKICB2YXIgeD1ldmVudC5wYWdlWC1sZWZ0OwogIHZhciB5PW","V2ZW50LnBhZ2VZLXRvcDsKICB2YXIgY3c9dGhpcy5jbGllbnRXaWR0aDsKICB2YX","IgY2g9dGhpcy5jbGllbnRIZWlnaHQ7CiAgdmFyIGl3PXRoaXMubmF0dXJhbFdpZH","RoOwogIHZhciBpaD10aGlzLm5hdHVyYWxIZWlnaHQ7CiAgdmFyIHB4PXgvY3cqaX","c7CiAgdmFyIHB5PXkvY2gqaWg7CiAgaWYocHg+MTIwICYmIHB4PDE4MCAmJiBweT","41MDAgJiYgcHk8NjAwICYmIGo9PTApewogICAgdmFyIHByb2I9TWF0aC5yYW5kb2","0oKTsKICAgIGlmKHByb2I8MC4wMSl7ZigyKTt9CiAgICBlbHNle2YoMSk7c2V0VG","ltZW91dChmLDQwMDAsMCk7fQogIH0KfSk7CgpuZXcgSW1hZ2UoKS5zcmM9dStzWz","FdO25ldyBJbWFnZSgpLnNyYz11K3NbMl07Cgo8L3NjcmlwdD48L2JvZHk+PC9odG","1sPg=="],"mediaType":"text/html"}],"mediaType":"image/gif","narrative":["You may think he is just a regular old chap, wait till you see","what he can reel in.","-","The Pixel Head Squad"],"creature name":"Loafing"},"metadata":null}},"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b5069786f73":{"quantity":22,"info":{"asset":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b5069786f73","policyId":"9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b","assetName":"5069786f73","fingerprint":"asset1n8aqrj4h8uws4qevft2s2wdq52nrax6jfvu8d3","quantity":293,"initialMintTxHash":"f92d2e27261a1172d88923f0deb682b5de3198d7135f4f95c6f83f9200bc6e34","mintOrBurnCount":8,"onchainMetadata":{"name":"Pixos","image":"Qmbw8QcgMMdUMnLxjFuxFeXZJxPioXW5WU1UJKwqZgLXNS","mediaType":"image/gif"},"metadata":null}}}';
  // let wallet_assets = JSON.parse(my_wallet_assets)
  // console.log(wallet_assets)

  var list_assets = Object.keys(wallet_assets).map(function(key){
    return wallet_assets[key].info ? wallet_assets[key].info : false;
  });
  console.log(list_assets)

  await saveAssets(list_assets)

  dispatch(setWalletAssets(wallet_assets));
  callback({ success: true, assets: wallet_assets });
  
};
