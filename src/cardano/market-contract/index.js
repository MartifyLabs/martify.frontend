import Cardano from "../serialization-lib";
import ErrorTypes from "./error.types";
import { serializeSale, deserializeSale } from "./datums";
import { BUY, CANCEL, UPDATE } from "./redeemers";
import { contractAddress, contractScripts } from "./validator";
import {
  assetsToValue,
  createTxOutput,
  finalizeTx,
  initializeTx,
} from "../transaction";
import { fromHex, toHex } from "../../utils";

export const listAsset = async (
  datum,
  seller: { address: BaseAddress, utxos: [] }
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = seller.utxos.map((utxo) =>
      Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );

    const lockAssetDatum = serializeSale(datum);
    datums.add(lockAssetDatum);

    outputs.add(
      createTxOutput(
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
      metadata: deserializeSale(lockAssetDatum),
    });
    return {
      datumHash,
      txHash,
    };
  } catch (error) {
    handleError(error, "listAsset");
  }
};

export const updateListing = async (
  currentDatum,
  newDatum,
  seller: { address: BaseAddress, utxos: [] },
  assetUtxo
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();

    const utxos = seller.utxos.map((utxo) =>
      Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );

    const currentListingDatum = serializeSale(currentDatum);
    datums.add(currentListingDatum);

    const newListingDatum = serializeSale(newDatum);
    datums.add(newListingDatum);

    outputs.add(
      createTxOutput(contractAddress(), assetUtxo.output().amount(), {
        datum: newListingDatum,
      })
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
      scriptUtxo: assetUtxo,
      plutusScripts: contractScripts(),
      action: UPDATE,
    });

    return {
      datumHash,
      txHash,
    };
  } catch (error) {
    handleError(error, "updateListing");
  }
};

export const cancelListing = async (
  datum,
  seller: { address: BaseAddress, utxos: [] },
  assetUtxo
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();

    const utxos = seller.utxos.map((utxo) =>
      Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );

    const cancelListingDatum = serializeSale(datum);
    datums.add(cancelListingDatum);

    outputs.add(
      createTxOutput(seller.address.to_address(), assetUtxo.output().amount())
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
      scriptUtxo: assetUtxo,
      plutusScripts: contractScripts(),
      action: CANCEL,
    });

    return txHash;
  } catch (error) {
    handleError(error, "cancelListing");
  }
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
  try {
    const { txBuilder, datums, outputs } = initializeTx();

    const utxos = buyer.utxos.map((utxo) =>
      Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );

    const purchaseAssetDatum = serializeSale(datum);
    datums.add(purchaseAssetDatum);

    outputs.add(
      createTxOutput(buyer.address.to_address(), assetUtxo.output().amount())
    );

    splitAmount(
      beneficiaries,
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
      scriptUtxo: assetUtxo,
      plutusScripts: contractScripts(),
      action: BUY,
    });

    return txHash;
  } catch (error) {
    handleError(error, "purchaseAsset");
  }
};

const handleError = (error, source) => {
  console.error(`Unexpected error in ${source}. [Message: ${error.message}]`);

  switch (error.message) {
    case "INPUT_LIMIT_EXCEEDED":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_SO_MANY_UTXOS);
    case "INPUTS_EXHAUSTED":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_NOT_ENOUGH_FUNDS);
    case "MIN_UTXO_ERROR":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_CHANGE_TOO_SMALL);
    case "MAX_SIZE_REACHED":
      throw new Error(ErrorTypes.TRANSACTION_FAILED_MAX_TX_SIZE_REACHED);
    default:
      if (error.message.search("OutputTooSmallUTxO") !== -1) {
        throw new Error(ErrorTypes.TRANSACTION_FAILED_ASSET_NOT_SPENDABLE);
      }
      throw error;
  }
};

const splitAmount = (
  { seller, artist, market },
  { price, royalties },
  outputs
) => {
  const minimumAmount = 1000000;
  const marketFeePercentage = 1 / 100;
  const royaltyFeePercentage = royalties / 1000;

  const royaltyFees = Math.max(royaltyFeePercentage * price, minimumAmount);
  outputs.add(
    createTxOutput(
      artist.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${royaltyFees}` }])
    )
  );

  const marketFees = Math.max(marketFeePercentage * price, minimumAmount);
  outputs.add(
    createTxOutput(
      market.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${marketFees}` }])
    )
  );

  const netPrice =
    price - royaltyFeePercentage * price - marketFeePercentage * price;
  outputs.add(
    createTxOutput(
      seller.to_address(),
      assetsToValue([
        { unit: "lovelace", quantity: `${Math.max(netPrice, minimumAmount)}` },
      ])
    )
  );
};
