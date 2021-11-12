import Cardano from "../serialization-lib";
import { serialize } from "./datums";
import { BUY, CANCEL } from "./redeemers";
import { contractAddress, contractScripts } from "./validator";
import {
  assetsToValue,
  createTxOutput,
  createTxUnspentOutput,
  finalizeTx,
  initializeTx,
} from "../transaction";
import { getUsedAddresses, getUtxos } from "../wallet";
import { fromHex, toHex, toLovelace } from "../../utils";

export const offer = async (tn, cs, price) => {
  await Cardano.load();
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const offerDatum = await serialize({
    tn,
    cs,
    sa: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
    price: toLovelace(price),
  });

  datums.add(offerDatum);

  outputs.add(
    await createTxOutput(
      await contractAddress(),
      await assetsToValue([
        {
          unit: `${cs}${tn}`,
          quantity: "1",
        },
        { unit: "lovelace", quantity: "1742000" },
      ]),
      { datum: offerDatum }
    )
  );

  const txHash = await finalizeTx({
    txBuilder,
    datums,
    utxos,
    outputs,
    changeAddress: walletAddress,
  });

  return txHash;
};

export const cancel = async (tn, cs, price, assetUtxos) => {
  await Cardano.load();
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const cancelDatum = await serialize({
    tn,
    cs,
    sa: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
    price: toLovelace(price),
  });

  datums.add(cancelDatum);

  const assetUtxo = assetUtxos.filter(
    (utxo) =>
      toHex(Cardano.Instance.hash_plutus_data(cancelDatum).to_bytes()) ===
      utxo.data_hash
  )[0];

  const scriptUtxo = await createTxUnspentOutput(assetUtxo);

  outputs.add(
    await createTxOutput(
      walletAddress.to_address(),
      scriptUtxo.output().amount()
    )
  );

  const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const txHash = await finalizeTx({
    txBuilder,
    datums,
    utxos,
    outputs,
    changeAddress: walletAddress,
    scriptUtxo,
    plutusScripts: await contractScripts(),
    action: CANCEL,
  });

  return txHash;
};

export const purchase = async (tn, cs, sa, price, assetUtxos) => {
  await Cardano.load();
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const sellerAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(sa)
  );

  const purchaseDatum = await serialize({
    tn,
    cs,
    sa: toHex(sellerAddress.payment_cred().to_keyhash().to_bytes()),
    price: toLovelace(price),
  });

  datums.add(purchaseDatum);

  const assetUtxo = assetUtxos.filter(
    (utxo) =>
      toHex(Cardano.Instance.hash_plutus_data(purchaseDatum).to_bytes()) ===
      utxo.data_hash
  )[0];

  const scriptUtxo = await createTxUnspentOutput(assetUtxo);

  outputs.add(
    await createTxOutput(
      walletAddress.to_address(),
      scriptUtxo.output().amount()
    )
  );

  outputs.add(
    await createTxOutput(
      sellerAddress.to_address(),
      await assetsToValue([
        { unit: "lovelace", quantity: `${toLovelace(price)}` },
      ])
    )
  );

  const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const txHash = await finalizeTx({
    txBuilder,
    utxos,
    outputs,
    datums,
    scriptUtxo,
    changeAddress: walletAddress,
    plutusScripts: await contractScripts(),
    action: BUY,
  });

  return txHash;
};
