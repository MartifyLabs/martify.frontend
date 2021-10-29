import cbor from "cbor";
import { getAssetInfo, getTxDetails } from "../../cardano/blockfrost-api";
import { setWalletAssets } from "../wallet/walletActions";

import { getTxUnspentOutputHash } from "../../cardano/transaction";

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

////

export const listToken = () => async (dispatch) => {
  try {
  } catch (err) {}
};

export const delistToken = () => async (dispatch) => {
  try {
  } catch (err) {}
};

export const buyToken = () => async (dispatch) => {
  try {
  } catch (err) {}
};

export const get_wallet_assets = (utxos, callback) => async (dispatch) => {
  try {
    console.log("wallet utxos", utxos);

    // https://github.com/Berry-Pool/nami-wallet#cardanogetutxosamount-paginate
    // `hex_encoded_bytes_string` is extracted from nami `cardano.getUtxos()`
    let hex_encoded_bytes_string =
      "828258204dc4ddabc322891da19a2a85b1e3abc3d708a6ab4e9d82fb03bce9f2fcd9087b018258390028be93c7117fef32c660d8b1b3cf9b24db3d2461b601429e921ec069d68b8a14843d44a83c55d0dfd24660e68788bb737d170a6054a22d42821a2e3e1a95a1581c9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88ba34a506978656c436f696e73185a4c506978656c48656164303031014c506978656c4865616430313101";
      
    console.log("hex_encoded_bytes_string", hex_encoded_bytes_string)
    var newhash = getTxUnspentOutputHash(hex_encoded_bytes_string);
    console.log("newhash", newhash)

    // TODO need to convert `hex_encoded_bytes_string` to `hash`.

    // sample: with the `hash`, get utxo
    let hash =
      "4dc4ddabc322891da19a2a85b1e3abc3d708a6ab4e9d82fb03bce9f2fcd9087b";
    let utxo = await getTxDetails(hash);
    console.log("utxo", utxo);

    // sample: from `utxo`, get asset's meta
    let asset =
      "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303031";
    let res_asset = await getAssetInfo(asset);
    console.log("asset", res_asset);
  } catch (err) {}
};

export const get_wallet_assets_mock = (utxos, callback) => async (dispatch) => {
  try {
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
  } catch (err) {}
};
