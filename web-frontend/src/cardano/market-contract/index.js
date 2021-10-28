import Cardano from "../serialization-lib";
import { serialize } from "./datums";
import { BUY } from "./redeemers";
import { cbor } from "./script";
import { createOutput, finalizeTx, initializeTx } from "../transaction";
import { getUsedAddresses, getUtxos } from "../wallet";
import { fromHex, toHex } from "../../utils";

const CARDANO = Cardano.Instance;

export const offer = async (tn, cs, price) => {
  const { txBuilder, datums, metadata, outputs } = await initializeTx();

  const walletAddress = CARDANO.BaseAddress.from_address(
    CARDANO.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    CARDANO.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const offerDatum = serialize({
    tn,
    cs,
    price,
    sellerAddress: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
  });

  outputs.add(
    createOutput(contractAddress(), undefined /* to be defined */, {
      datum: offerDatum,
      index: 0,
      tradeOwnerAddress: walletAddress,
      metadata,
    })
  );
  datums.add(offerDatum);

  const txHash = await finalizeTx({
    txBuilder,
    changeAddress: walletAddress,
    utxos,
    outputs,
    datums,
    metadata,
  });
  return txHash;
};

export const cancel = async () => {};

export const purchase = async (tokenUtxo) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = CARDANO.BaseAddress.from_address(
    CARDANO.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    CARDANO.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  datums.add(tokenUtxo.datum);

  const token = tokenUtxo.utxo.output().amount();

  outputs.add(createOutput(walletAddress.to_address(), token));

  const requiredSigners = CARDANO.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const txHash = await finalizeTx({
    txBuilder,
    utxos,
    outputs,
    datums,
    scriptUtxo: tokenUtxo.utxo,
    changeAddress: walletAddress,
    plutusScripts: contractScripts(),
    action: BUY,
  });

  return txHash;
};

export const contractAddress = () => {
  CARDANO.Address.from_bech32(
    "addr_test1wq2m8ul5twkj8c0mc2nyxgr8ylk2u07rj882hs90a5yrhzgwgatvu"
  );
};

export const contractScripts = () => {
  const scripts = CARDANO.PlutusScripts.new();

  scripts.add(CARDANO.PlutusScript.new(fromHex(cbor)));

  return scripts;
};
