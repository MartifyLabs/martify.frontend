import Cardano from "../serialization-lib";
import { serialize } from "./datums";
import { BUY } from "./redeemers";
import { cbor } from "./script";
import { createTxOutput, finalizeTx, initializeTx } from "../transaction";
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
          unit: cs,
          quantity: "1",
        },
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

export const purchase = async (tokenUtxo) => {
  await Cardano.load();
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bytes(fromHex((await getUsedAddresses())[0]))
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  datums.add(tokenUtxo.datum);

  const token = tokenUtxo.utxo.output().amount();

  outputs.add(createTxOutput(walletAddress.to_address(), token));

  const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const txHash = await finalizeTx({
    txBuilder,
    utxos,
    outputs,
    datums,
    scriptUtxo: tokenUtxo.utxo,
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

  scripts.add(Cardano.Instance.PlutusScript.new(fromHex(cbor)));

  return scripts;
};

const assetsToValue = async (assets) => {
  await Cardano.load();
  const multiAsset = Cardano.Instance.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit === "lovelace");
  const policies = [
    ...new Set(
      assets
        .filter((asset) => asset.unit !== "lovelace")
        .map((asset) => asset.unit.slice(0, 56))
    ),
  ];
  policies.forEach((policy) => {
    const policyAssets = assets.filter(
      (asset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = Cardano.Instance.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        Cardano.Instance.AssetName.new(Buffer.from(asset.unit.slice(56), "hex")),
        Cardano.Instance.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Cardano.Instance.ScriptHash.from_bytes(Buffer.from(policy, "hex")),
      assetsValue
    );
  });
  const value = Cardano.Instance.Value.new(
    Cardano.Instance.BigNum.from_str(lovelace ? lovelace.quantity : "0")
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
};
