import { apiKey, cardanoUrl, ipfsUrl } from "../../config";

/**
 * @param {string} asset - asset is a Concatenation of the policy_id and hex-encoded asset_name.
 */
export const getAssetInfo = async (asset) => {
  const response = await cardano(`assets/${asset}`);

  return {
    asset: response.asset,
    policyId: response.policy_id,
    assetName: response.asset_name,
    fingerprint: response.fingerprint,
    quantity: parseInt(response.quantity),
    initialMintTxHash: response.initial_mint_tx_hash,
    mintOrBurnCount: parseInt(response.mint_or_burn_count),
    onchainMetadata: response.onchain_metadata,
    metadata: response.metadata,
  };
};

export const getTxDetails = async (hash) => {
  const response = await cardano(`txs/${hash}/utxos`);

  return {
    hash: response.hash,
    inputs: response.inputs,
    outputs: response.outputs,
  };
};

export const getProtocolParameters = async () => {
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
};

export const ipfsBlockfrost = async (endpoint, headers, body) => {
  return await request(ipfsUrl, endpoint, headers, body);
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
