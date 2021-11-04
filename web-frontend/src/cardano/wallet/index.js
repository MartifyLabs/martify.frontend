import Cardano from "../serialization-lib";
import { getTxDetails } from "../blockfrost-api";
import { getAsset } from "../../database";
import { getTxUnspentOutputHash } from "../transaction";
import { fromHex } from "../../utils";

export const getBalance = async () => {
  return await window.cardano.getBalance();
};

export const getCollateral = async () => {
  return await window.cardano.getCollateral();
};

export const getNetworkId = async () => {
  return await window.cardano.getNetworkId();
};

export const getOwnedAssets = async () => {
  // TODO: refactor using map, filter and reduce.
  await Cardano.load();
  let assets = {};

  const usedAddress = Cardano.Instance.Address.from_bytes(
    fromHex((await getUsedAddresses())[0])
  ).to_bech32();

  const utxos = await getUtxos();

  for (var u_i in utxos) {
    let utxo_hex_byte_string = utxos[u_i];
    let utxo_hash = await getTxUnspentOutputHash(utxo_hex_byte_string);

    let utxo = await getTxDetails(utxo_hash);

    const ownedOutputs = utxo.outputs.filter((o) => {
      return o.address === usedAddress;
    });

    for (var o_i in ownedOutputs) {
      let this_tx_out = ownedOutputs[o_i];
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
      let asset_info = await getAsset(asset_id);
      assets[asset_id].info = asset_info.info;
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
