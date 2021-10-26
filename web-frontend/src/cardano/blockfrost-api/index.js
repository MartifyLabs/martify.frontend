import { apiKey, cardanoUrl, ipfsUrl } from "../../config";

export const getProtocolParameters = async () => {
  const response = await cardanoBlockfrost(`/epochs/latest/parameters`);
  
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

export const cardanoBlockfrost = async (endpoint, headers, body) => {
  return await request(cardanoUrl, endpoint, headers, body);
};

export const ipfsBlockfrost = async (endpoint, headers, body) => {
  return await request(ipfsUrl, endpoint, headers, body);
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
