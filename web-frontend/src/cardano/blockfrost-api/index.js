import { apiKey, cardanoUrl, ipfsUrl } from "../../config";

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
