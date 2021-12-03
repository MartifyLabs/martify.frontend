import {
  collections_loaded,
  collections_add_tokens,
  collections_loading,
  collections_add_assets,
} from "./collectionActions";

import data_collections from "../../data/collections.json";
import data_collections_cnft from "../../data/collections-cnft.json";

import {
  getAsset,
  getAssets,
  saveAsset,
  getCollectionAssets,
  getLockedAssets,
} from "../../database/assets";

import { getUsedAddress } from "../../cardano/wallet";

export const load_collection = (callback) => async (dispatch) => {
  let all_collections = {};

  for (var collection_id in data_collections) {
    var tmp = data_collections[collection_id];
    tmp.is_martify_verified = true;

    if (tmp.style) {
      if (tmp.style.banner)
        tmp.style.banner_path = `/images/collections/${tmp.id}/${tmp.style.banner}`;
      if (tmp.style.logo)
        tmp.style.logo_path = `/images/collections/${tmp.id}/${tmp.style.logo}`;
    }
    all_collections[collection_id] = tmp;
  }

  for (var collection_id in data_collections_cnft) {
    var tmp = data_collections_cnft[collection_id];
    if (tmp.id in all_collections) {
      all_collections[tmp.id].policy_ids = [
        ...all_collections[tmp.id].policy_ids,
        ...tmp.policy_ids,
      ];
    } else {
      tmp.is_cnft_verified = true;
      all_collections[collection_id] = tmp;
    }
  }

  for (var collection_id in all_collections) {
    all_collections[collection_id].policy_ids = [...new Set(all_collections[collection_id].policy_ids)];
  }

  dispatch(collections_loaded(all_collections));
  callback({ all_collections });
};

export const get_listings = (policy_id, callback) => async (dispatch) => {
  dispatch(collections_loading(true));

  let output = {
    policy_id: policy_id,
    listing: {},
  };

  const assets = await getCollectionAssets(policy_id);
  if (assets) {
    for (var i in assets) {
      let asset = assets[i];
      if (asset) {
        if (asset.details) {
          output.listing[asset.details.asset] = asset;
        }
      }
    }

    if (output.policy_id && output.listing) {
      dispatch(collections_add_tokens(output));
    }
  }

  callback(true);
};

export const get_assets = (assetIds, callback) => async (dispatch) => {
  dispatch(collections_loading(true));

  let output = {
    // this is so to match wallet schema
    assets: {},
  };
  let assets = await getAssets(assetIds);

  for (var i in assets) {
    let asset = assets[i];
    if (asset) {
      if (asset.details) {
        output.assets[asset.details.asset] = asset;
      }
    }
  }

  dispatch(collections_add_assets(output));

  callback(true);
};

function add_token(asset, dispatch) {
  let output = {
    policy_id: asset.details.policyId,
    listing: {
      [asset.details.asset]: asset,
    },
  };
  dispatch(collections_add_tokens(output));
}

export const get_asset = (asset_id, callback) => async (dispatch) => {
  dispatch(collections_loading(true));

  let asset = await getAsset(asset_id);

  if (asset) add_token(asset, dispatch);
  callback(true);
};

export const get_listed_assets = (callback) => async (dispatch) => {
  // dispatch(collections_loading(true));

  let listed_assets = await getLockedAssets(1);

  let listed_assets_by_policy = {};

  for (var i in listed_assets) {
    let asset = listed_assets[i];

    if (asset) {
      if (asset.details) {
        if (!(asset.details.policyId in listed_assets_by_policy)) {
          listed_assets_by_policy[asset.details.policyId] = {
            policy_id: asset.details.policyId,
            listing: {},
          };
        }
        listed_assets_by_policy[asset.details.policyId].listing[
          asset.details.asset
        ] = asset;
      }
    }
  }

  for (var policy_id in listed_assets_by_policy) {
    dispatch(collections_add_tokens(listed_assets_by_policy[policy_id]));
  }

  callback({ success: true, data: listed_assets });
};

export const asset_add_offer =
  (asset_id, price, callback) => async (dispatch) => {
    let asset = await getAsset(asset_id);

    let wallet_address = await getUsedAddress();

    if (!("offers" in asset)) {
      asset.offers = {};
    }

    let offer = {
      t: new Date().getTime(),
      p: price,
    };

    asset.offers[wallet_address] = offer;

    await saveAsset(asset);

    add_token(asset, dispatch);

    callback({ success: true, type: "offer-success" });
  };

export const opencnft_get_top_projects =
  (time, callback) => async (dispatch) => {
    fetch("https://api.opencnft.io/1/rank?window=" + time, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        callback({ success: true, data: res.ranking });
      });
  };

export const opencnft_get_policy =
  (policy_id, callback) => async (dispatch) => {
    fetch(`https://api.opencnft.io/1/policy/${policy_id}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        callback({ success: true, data: res });
      });
  };

export const opencnft_get_asset_tx =
  (asset_id, callback) => async (dispatch) => {
    fetch(`https://api.opencnft.io/1/asset/${asset_id}/tx`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
        callback({ success: true, data: res });
      });
  };
