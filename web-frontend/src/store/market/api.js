import cbor from "cbor";
import {cardanoBlockfrost} from "../../cardano/blockfrost-api";

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

////

export const listToken = () => async (dispatch) => {
  try {
    
  } catch (err) {
    
  }
}

export const delistToken = () => async (dispatch) => {
  try {
    
  } catch (err) {
    
  }
}

export const buyToken = () => async (dispatch) => {
  try {
    
  } catch (err) {
    
  }
}

export const get_wallet_assets = (utxos, callback) => async (dispatch) => {
  try {

    console.log("wallet utxos", utxos);

    // https://github.com/Berry-Pool/nami-wallet#cardanogetutxosamount-paginate
    // `hex_encoded_bytes_string` is extracted from nami `cardano.getUtxos()`
    let hex_encoded_bytes_string = "828258204dc4ddabc322891da19a2a85b1e3abc3d708a6ab4e9d82fb03bce9f2fcd9087b018258390028be93c7117fef32c660d8b1b3cf9b24db3d2461b601429e921ec069d68b8a14843d44a83c55d0dfd24660e68788bb737d170a6054a22d42821a2e3e1a95a1581c9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88ba34a506978656c436f696e73185a4c506978656c48656164303031014c506978656c4865616430313101";

    // TODO need to convert `hex_encoded_bytes_string` to `hash`.

    // sample: with the `hash`, get utxo
    let hash = "4dc4ddabc322891da19a2a85b1e3abc3d708a6ab4e9d82fb03bce9f2fcd9087b"
    let utxo = await cardanoBlockfrost(`txs/${hash}/utxos`)
    console.log(utxo);


    // sample: from `utxo`, get asset's meta
    let asset = "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303031";
    let res_asset = await cardanoBlockfrost(`assets/${asset}`)
    console.log(res_asset);

  } catch (err) {
    
  }
}
