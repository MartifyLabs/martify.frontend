import { contractAddress, purchase } from "../../cardano/market-contract/";
import { createTxUnspentOutput } from "../../cardano/transaction";
import { getLockedAssetUtxos } from "../../cardano/blockfrost-api";
import { getWalletAddresses } from "../../cardano/wallet";
import { saveAsset, getAsset } from "../../database";

import { collections_add_tokens } from "../collection/collectionActions";

export const listToken = (asset, price, callback) => async (dispatch) => {
  try {
    // note: if price == 0, means user wanna delist it

    let asset_updated = await getAsset(asset.info.asset);

    // call market, list on market
    console.log(
      "listToken on market",
      asset.info.assetName,
      asset.info.policyId,
      price
    );
    //let txHash = await offer(asset.info.assetName, asset.info.policyId, price.toString());
    const utxos = await getLockedAssetUtxos(
      await contractAddress(),
      "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b42617457696e67733034"
    );
    const scriptUtxo = await createTxUnspentOutput(utxos[0]);
    let txHash = await purchase(
      "42617457696e67733034",
      "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b",
      "99",
      "addr_test1qzl2r3fpmav0fmh0vrry0e0tmzxxqwv32sylnlty2jj8dwg636sfudakhsh65qggs4ttjjsk8fuu3fkd65uaxcxv0tfqv3z0y3",
      scriptUtxo
    );
    console.log("txHash", txHash);

    if (price > 0) {
      let wallet_address = await getWalletAddresses();
      asset_updated.listing = {
        is_listed: true,
        listed_on: new Date().getTime(),
        price: price,
        addr: wallet_address,
      };
    } else {
      asset_updated.listing = {
        is_listed: false,
      };
    }

    await saveAsset(asset_updated);

    let output = {
      policy_id: asset.info.policyId,
      listing: {
        [asset_updated.info.asset]: asset_updated,
      },
    };
    dispatch(collections_add_tokens(output));

    callback({ success: true });
  } catch (error) {
    console.error(`Unexpected error in listToken. [Message: ${error.message}]`);
  }
};

export const delistToken = () => async (dispatch) => {
  try {
  } catch (error) {
    console.error(
      `Unexpected error in delistToken. [Message: ${error.message}]`
    );
  }
};

export const purchaseToken = () => async (dispatch) => {
  try {
  } catch (err) {}
};
