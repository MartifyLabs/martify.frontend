import { apiKey, cardanoUrl } from "../../config";
import { fromHex, toString } from "../../utils";

/**
 * @param {string} asset - asset is a Concatenation of the policy_id and hex-encoded asset_name.
 */
export const getAssetInfo = async (asset) => {
  try {
    const response = await cardano(`assets/${asset}`);

    return {
      asset: response.asset,
      policyId: response.policy_id,
      assetName: response.asset_name,
      readableAssetName: toString(fromHex(response.asset_name)),
      fingerprint: response.fingerprint,
      quantity: parseInt(response.quantity),
      initialMintTxHash: response.initial_mint_tx_hash,
      mintOrBurnCount: parseInt(response.mint_or_burn_count),
      onchainMetadata: response.onchain_metadata,
      metadata: response.metadata,
    };
  } catch (error) {
    console.error(
      `Unexpected error in getAssetInfo. [Message: ${error.message}]`
    );
  }
};

export const getAssetTransactions = async (
  asset,
  { page, count, order } = { page: 1, count: 100, order: "asc" }
) => {
  try {
    return await cardano(
      `assets/${asset}/transactions?page=${page}&count=${count}&order=${order}`
    );
  } catch (error) {
    console.error(
      `Unexpected error in getAssetTransactions. [Message: ${error.message}]`
    );
  }
};

/**
 * @param {string} address - address must be in bech_32 format.
 */
export const getLockedUtxos = async (address) => {
  try {
    return await cardano(`addresses/${address}/utxos`);
  } catch (error) {
    console.error(
      `Unexpected error in getLockedUtxos. [Message: ${error.message}]`
    );
  }
};

/**
 * @param {string} address - address must be in bech_32 format.
 * @param {string} asset - asset is a Concatenation of the policy_id and hex-encoded asset_name.
 */
export const getLockedUtxosByAsset = async (address, asset) => {
  try {
    return await cardano(`addresses/${address}/utxos/${asset}`);
  } catch (error) {
    console.error(
      `Unexpected error in getLockedUtxosByAsset. [Message: ${error.message}]`
    );
  }
};

export const getMintedAssets = async (policyId) => {
  try {
    const response = await cardano(`assets/policy/${policyId}`);

    return response.map((asset) => asset.asset);
  } catch (error) {
    console.error(
      `Unexpected error in getMintedAssets. [Message: ${error.message}]`
    );
  }
};

export const getTxMetadata = async (hash) => {
  try {
    return await cardano(`txs/${hash}/metadata`);
  } catch (error) {
    console.error(
      `Unexpected error in getTxMetadata. [Message: ${error.message}]`
    );
  }
};

export const getTxUtxos = async (hash) => {
  try {
    const response = await cardano(`txs/${hash}/utxos`);

    return {
      hash: response.hash,
      inputs: response.inputs,
      outputs: response.outputs,
    };
  } catch (error) {
    console.error(
      `Unexpected error in getTxUtxos. [Message: ${error.message}]`
    );
  }
};

export const getProtocolParameters = async () => {
  try {
    const response = await cardano(`epochs/latest/parameters`);

    return {
      linearFee: {
        minFeeA: response.min_fee_a.toString(),
        minFeeB: response.min_fee_b.toString(),
      },
      minUtxo: response.min_utxo,
      poolDeposit: response.pool_deposit,
      keyDeposit: response.key_deposit,
      maxValSize: parseInt(response.max_val_size),
      maxTxSize: parseInt(response.max_tx_size),
      priceMem: parseFloat(response.price_mem),
      priceStep: parseFloat(response.price_step),
    };
  } catch (error) {
    console.error(
      `Unexpected error in getProtocolParameters. [Message: ${error.message}]`
    );
  }
};

const cardano = async (endpoint, headers, body) => {
  return await request(cardanoUrl, endpoint, headers, body);
};

const request = async (base, endpoint, headers, body) => {
  return await fetch(base + endpoint, {
    headers: {
      project_id: apiKey,
      ...headers,
    },
    method: body ? "POST" : "GET",
    body,
  }).then((res) => res.json());
};
