/* development */
export const apiKey = process.env.REACT_APP_BLOCKFROST_API_KEY;
export const cardanoUrl = process.env.REACT_APP_BLOCKFROST_API_URL;
export const nami_network = parseInt(process.env.REACT_APP_CARDANO_NETWORK_ID);

export const urls = {
  root: "http://localhost:3000/",
  cardanoscan: process.env.REACT_APP_CARDANOSCAN_URL,
  ipfs: "https://infura-ipfs.io/ipfs/"
}
