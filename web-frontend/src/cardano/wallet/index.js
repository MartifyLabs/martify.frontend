export const getCollateral = async () => {
  return await window.cardano.getCollateral();
}

export const getUsedAddresses = async () => {
  return await window.cardano.getUsedAddresses();
}

export const getUtxos = async () => {
  return await window.cardano.getUtxos();
}

export const signTx = async (tx, partialSign = true) => {
  return await window.cardano.signTx(tx, partialSign);
}

export const submitTx = async (tx) => {
  return await window.cardano.submitTx(tx);
}
