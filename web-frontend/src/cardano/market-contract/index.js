import Cardano from "../serialization-lib";
import { serialize } from "./datums";
import { BUY } from "./redeemers";
import { cborHex } from "./script";
import {
  assetsToValue,
  createTxOutput,
  finalizeTx,
  initializeTx,
} from "../transaction";
import { getUsedAddresses, getUtxos } from "../wallet";
import { fromHex, toHex } from "../../utils";

export const offer = async (tn, cs, price) => {
  await Cardano.load();
  const { txBuilder, datums, metadata, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const offerDatum = await serialize({
    tn,
    cs,
    price,
    sellerAddress: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
  });

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
      {
        datum: offerDatum,
        index: 0,
        tradeOwnerAddress: walletAddress,
        metadata,
      }
    )
  );
  datums.add(offerDatum);

  const txHash = await finalizeTx({
    txBuilder,
    changeAddress: walletAddress,
    utxos,
    outputs,
    datums,
    metadata,
    plutusScripts: await contractScripts(),
  });
  return txHash;
};

export const cancel = async () => {};

export const purchase = async (tn, cs, price, sellerAddress, scriptUtxo) => {
  await Cardano.load();
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const sa = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(sellerAddress)
  );

  const offerDatum = await serialize({
    tn,
    cs,
    price,
    sellerAddress: toHex(sa.payment_cred().to_keyhash().to_bytes()),
  });

  datums.add(offerDatum);

  outputs.add(
    await createTxOutput(
      walletAddress.to_address(),
      scriptUtxo.output().amount()
    )
  );

  outputs.add(
    await createTxOutput(
      sa.to_address(),
      await assetsToValue([
        { unit: "lovelace", quantity: `${price * 1000000}` },
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

export const contractAddress = async () => {
  await Cardano.load();

  return Cardano.Instance.Address.from_bech32(
    "addr_test1wq2m8ul5twkj8c0mc2nyxgr8ylk2u07rj882hs90a5yrhzgwgatvu"
  );
};

export const contractScripts = async () => {
  await Cardano.load();

  const scripts = Cardano.Instance.PlutusScripts.new();

  scripts.add(Cardano.Instance.PlutusScript.new(fromHex(cborHex)));

  return scripts;
};

/*const utxoToDatum = async (utxo) => {
  const metadata = await blockfrostRequest(`/txs/${utxo.tx_hash}/metadata`);
  let datum;
  let tradeOwnerAddress;
  try {
    datum = metadata
      .find((m) => m.label == DATUM_LABEL)
      .json_metadata[utxo.output_index].slice(2);
    if (datum != toHex(START_BID().to_bytes()))
      //STARTBID doesn't have a tradeOwner
      tradeOwnerAddress = metadata
        .find((m) => m.label == ADDRESS_LABEL)
        .json_metadata.address.slice(2);
  } catch (e) {
    throw new Error("Some required metadata entries were not found");
  }
  datum = Loader.Cardano.PlutusData.from_bytes(fromHex(datum));
  if (
    toHex(Loader.Cardano.hash_plutus_data(datum).to_bytes()) !== utxo.data_hash
  )
    throw new Error("Datum hash doesn't match");

  return {
    datum,
    tradeOwnerAddress:
      tradeOwnerAddress &&
      Loader.Cardano.Address.from_bytes(fromHex(tradeOwnerAddress)),
    utxo: Loader.Cardano.TransactionUnspentOutput.new(
      Loader.Cardano.TransactionInput.new(
        Loader.Cardano.TransactionHash.from_bytes(fromHex(utxo.tx_hash)),
        utxo.output_index
      ),
      Loader.Cardano.TransactionOutput.new(
        CONTRACT_ADDRESS(),
        assetsToValue(utxo.amount)
      )
    ),
    budId,
  };
};*/
