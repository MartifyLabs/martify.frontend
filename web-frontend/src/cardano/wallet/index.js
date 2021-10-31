import { getAssetInfo, getTxDetails } from "../blockfrost-api";
import { getTxUnspentOutputHash } from "../transaction";

export const getCollateral = async () => {
  return await window.cardano.getCollateral();
};

export const getOwnedAssets = async () => {
  // TODO: refactor using map, filter and reduce.
  let assets = {};
  const utxos = await getUtxos();

  for (var u_i in utxos) {
    let utxo_hex_byte_string = utxos[u_i];
    let utxo_hash = await getTxUnspentOutputHash(utxo_hex_byte_string);

    let utxo = await getTxDetails(utxo_hash);

    for (var o_i in utxo.outputs) {
      let this_tx_out = utxo.outputs[o_i];
      for (var a_i in this_tx_out.amount) {
        let this_unit = this_tx_out.amount[a_i].unit;
        if (!(this_unit in assets)) assets[this_unit] = { quantity: 0 };
        assets[this_unit].quantity += parseInt(
          this_tx_out.amount[a_i].quantity
        );
      }
    }
  }

  for (var asset_id in assets) {
    if (asset_id !== "lovelace") {
      let asset_info = await getAssetInfo(asset_id);
      assets[asset_id].info = asset_info;
    }
  }

  return assets;
};

export const getUsedAddresses = async () => {
  return await window.cardano.getUsedAddresses();
};

export const getUtxos = async () => {
  return await window.cardano.getUtxos();
};

export const signTx = async (tx, partialSign = true) => {
  return await window.cardano.signTx(tx, partialSign);
};

export const submitTx = async (tx) => {
  return await window.cardano.submitTx(tx);
};
