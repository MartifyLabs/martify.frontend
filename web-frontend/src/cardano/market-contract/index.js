import Cardano from "../serialization-lib";
import { finalizeTx, initializeTx } from "../transaction";
import { getUsedAddresses, getUtxos } from "../wallet";
import { contractHex } from "./script";
import { fromHex } from "../../utils";

const CARDANO = Cardano.Instance();

export const buyToken = async (offerUtxo) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = CARDANO.BaseAddress.from_address(
    CARDANO.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    CARDANO.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  datums.add(offerUtxo.datum);

  const datumType = offerUtxo.datum.as_constr_plutus_data().tag().as_i32();
  const tradeDetails = getTradeDetails(offerUtxo.datum);
  const value = offerUtxo.utxo.output().amount();
  const lovelaceAmount = tradeDetails.requestedAmount;
  if (datumType !== DATUM_TYPE.Offer)
    throw new Error("Datum needs to be Offer");

  splitAmount(lovelaceAmount, offerUtxo.tradeOwnerAddress, outputs);

  outputs.add(createOutput(walletAddress.to_address(), value)); // buyer receiving SpaceBud

  const requiredSigners = CARDANO.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const txHash = await finalizeTx({
    txBuilder,
    changeAddress: walletAddress,
    utxos,
    outputs,
    datums,
    scriptUtxo: offerUtxo.utxo,
    action: BUY,
  });
  return txHash;
};

export const contractAddress = () => {
  CARDANO.Address.from_bech32("MARKET_CONTRACT_ADDRESS");
};

export const contractScripts = () => {
  const scripts = CARDANO.PlutusScripts.new();

  scripts.add(CARDANO.PlutusScript.new(fromHex(contractHex)));

  return scripts;
};
