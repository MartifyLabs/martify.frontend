import Cardano from "../serialization-lib";
import { serializeSale } from "./datums";
import { BUY, CANCEL, UPDATE } from "./redeemers";
import { contractAddress, contractScripts } from "./validator";
import {
  assetsToValue,
  createTxOutput,
  createTxUnspentOutput,
  finalizeTx,
  initializeTx,
} from "../transaction";
import { fromHex, toHex } from "../../utils";

export const listAsset = async (
  datum,
  seller: { address: BaseAddress, utxos: [] }
) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const utxos = seller.utxos.map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const lockAssetDatum = serializeSale(datum);
  datums.add(lockAssetDatum);

  outputs.add(
    await createTxOutput(
      contractAddress(),
      assetsToValue([
        {
          unit: `${datum.cs}${datum.tn}`,
          quantity: "1",
        },
        { unit: "lovelace", quantity: "2000000" },
      ]),
      { datum: lockAssetDatum }
    )
  );

  const datumHash = toHex(
    Cardano.Instance.hash_plutus_data(lockAssetDatum).to_bytes()
  );

  const txHash = await finalizeTx({
    txBuilder,
    datums,
    utxos,
    outputs,
    changeAddress: seller.address,
  });

  return {
    datumHash,
    txHash,
  };
};

export const updateListing = async (
  currentDatum,
  newDatum,
  seller: { address: BaseAddress, utxos: [] },
  assetUtxo
) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const utxos = seller.utxos.map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const currentListingDatum = serializeSale(currentDatum);
  datums.add(currentListingDatum);

  const newListingDatum = serializeSale(newDatum);
  datums.add(newListingDatum);

  outputs.add(
    await createTxOutput(
      contractAddress(),
      createTxUnspentOutput(assetUtxo).output().amount(),
      { datum: newListingDatum }
    )
  );

  const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
  requiredSigners.add(seller.address.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const datumHash = toHex(
    Cardano.Instance.hash_plutus_data(newListingDatum).to_bytes()
  );

  const txHash = await finalizeTx({
    txBuilder,
    datums,
    utxos,
    outputs,
    changeAddress: seller.address,
    scriptUtxo: createTxUnspentOutput(assetUtxo),
    plutusScripts: contractScripts(),
    action: UPDATE,
  });

  return {
    datumHash,
    txHash,
  };
};

export const cancelListing = async (
  datum,
  seller: { address: BaseAddress, utxos: [] },
  assetUtxo
) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const utxos = seller.utxos.map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const cancelListingDatum = serializeSale(datum);
  datums.add(cancelListingDatum);

  outputs.add(
    await createTxOutput(
      seller.address.to_address(),
      createTxUnspentOutput(assetUtxo).output().amount()
    )
  );

  const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
  requiredSigners.add(seller.address.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const txHash = await finalizeTx({
    txBuilder,
    datums,
    utxos,
    outputs,
    changeAddress: seller.address,
    scriptUtxo: createTxUnspentOutput(assetUtxo),
    plutusScripts: contractScripts(),
    action: CANCEL,
  });

  return txHash;
};

export const purchaseAsset = async (
  datum,
  buyer: { address: BaseAddress, utxos: [] },
  beneficiaries: {
    seller: BaseAddress,
    artist: BaseAddress,
    market: BaseAddress,
  },
  assetUtxo
) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const utxos = buyer.utxos.map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const purchaseAssetDatum = serializeSale(datum);
  datums.add(purchaseAssetDatum);

  outputs.add(
    await createTxOutput(
      buyer.address.to_address(),
      createTxUnspentOutput(assetUtxo).output().amount()
    )
  );

  await splitAmount(
    beneficiaries.seller,
    beneficiaries.artist,
    beneficiaries.market,
    {
      price: datum.price,
      royalties: datum.rp,
    },
    outputs
  );

  const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
  requiredSigners.add(buyer.address.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const txHash = await finalizeTx({
    txBuilder,
    utxos,
    outputs,
    datums,
    changeAddress: buyer.address,
    scriptUtxo: createTxUnspentOutput(assetUtxo),
    plutusScripts: contractScripts(),
    action: BUY,
  });

  return txHash;
};

const splitAmount = async (
  seller,
  artist,
  market,
  { price, royalties },
  outputs
) => {
  const minimumAmount = 1600000;
  const marketFeePercentage = 2 / 100;
  const royaltyFeePercentage = royalties / 100;

  const royaltyFees = Math.max(royaltyFeePercentage * price, minimumAmount);
  outputs.add(
    await createTxOutput(
      artist.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${royaltyFees}` }])
    )
  );

  const marketFees = Math.max(marketFeePercentage * price, minimumAmount);
  outputs.add(
    await createTxOutput(
      market.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${marketFees}` }])
    )
  );

  const netPrice =
    price - royaltyFeePercentage * price - marketFeePercentage * price;
  outputs.add(
    await createTxOutput(
      seller.to_address(),
      assetsToValue([
        { unit: "lovelace", quantity: `${Math.max(netPrice, minimumAmount)}` },
      ])
    )
  );
};
