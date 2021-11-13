import { offer, cancel, purchase } from "../../cardano/market-contract/";
import { getWalletAddresses } from "../../cardano/wallet";
import { saveAsset, getAsset } from "../../database";
import { contractAddress } from "../../cardano/market-contract/validator";
import { getLockedUtxosByAsset } from "../../cardano/blockfrost-api";

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
    let txHash = await offer(
      asset.info.assetName,
      asset.info.policyId,
      price.toString()
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
    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      `9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303032`
    );
    console.log(assetUtxos);
    let txHash = await cancel(
      "506978656c48656164303032",
      "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b",
      "99",
      assetUtxos
    );
    console.log("txHash", txHash);
  } catch (error) {
    console.error(
      `Unexpected error in delistToken. [Message: ${error.message}]`
    );
  }
};

export const purchaseToken = () => async (dispatch) => {
  try {
    const assetUtxos = await getLockedUtxosByAsset(
      contractAddress().to_bech32(),
      `9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b506978656c48656164303032`
    );
    console.log(assetUtxos);
    let txHash = await purchase(
      "506978656c48656164303032",
      "9236a326ec65243627d89f60921a42314d0cd407c002280499e1f88b",
      "addr_test1qrsea3gp4svseqz25htcdk3x6jn0xlhpqdtzkq3tx68plnrk6swlz45fv76s89g6ewcennvckqkep36767kwpzchr4nq5yz5ky",
      "99",
      assetUtxos
    );
    console.log("txHash", txHash);
  } catch (err) {}
};
