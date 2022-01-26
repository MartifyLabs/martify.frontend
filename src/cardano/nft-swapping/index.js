import Cardano from "../serialization-lib";
import ErrorTypes from "./error.types";
import { serializeList, deserializeList, deserializeOffer, serializeOffer } from "./datums";
import { CANCEL, ACCEPT, REFUSE } from "./redeemers";
import { contractAddress, contractScripts } from "./validator";
import {
  assetsToValue,
  createTxOutput,
  finalizeTx,
  initializeTx,
  serializeTxUnspentOutput,
} from "../transaction";
import { toHex } from "../../utils/converter";

export const listBundle = async (
  datum,
  seller: { address: BaseAddress, utxos: [] },
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = seller.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const lockAssetDatum = serializeList(datum);
    datums.add(lockAssetDatum);

    const assets = [];
    for (let i = 0; i < datum.cstns.length; i++) {
      assets.push({
        unit: `${datum.cstns[i][0]}${datum.cstns[i][1]}`,
        quantity: "1",
      })
    };
    assets.push({ unit: "lovelace", quantity: "4000000" });

    outputs.add(
      createTxOutput(
        contractAddress(version),
        assetsToValue(assets),
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
      metadata: deserializeList(lockAssetDatum),
    });
    return {
      datumHash,
      txHash,
    };
  } catch (error) {
    handleError(error, "listBundle");
  }
};

export const listOffer = async (
  datum,
  seller: { address: BaseAddress, utxos: [] },
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = seller.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const lockAssetDatum = serializeOffer(datum);
    datums.add(lockAssetDatum);

    const assets = [];
    for (let i = 0; i < datum.offTokens.length; i++) {
      assets.push({
        unit: `${datum.offTokens[i][0]}${datum.offTokens[i][1]}`,
        quantity: "1",
      })
    };
    assets.push({ unit: "lovelace", quantity: "4000000" });

    outputs.add(
      createTxOutput(
        contractAddress(version),
        assetsToValue(assets),
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
      metadata: deserializeOffer(lockAssetDatum),
    });
    return {
      datumHash,
      txHash,
    };
  } catch (error) {
    handleError(error, "listOffer");
  }
};


export const cancelOffer = async (
  datum,
  offerer: { address: BaseAddress, utxos: [] },
  offerUtxo,
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = offerer.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const cancelOfferDatum = serializeOffer(datum);
    datums.add(cancelOfferDatum);

    outputs.add(
      createTxOutput(offerer.address.to_address(), offerUtxo.output().amount())
    );

    const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
    requiredSigners.add(offerer.address.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const txHash = await finalizeTx({
      txBuilder,
      datums,
      utxos,
      outputs,
      changeAddress: offerer.address,
      offerUtxo,
      plutusScripts: contractScripts(version),
      action: CANCEL,
    });

    return txHash;
  } catch (error) {
    handleError(error, "cancelOffer");
  }
};

export const refuseOffer = async (
  datumOffer,
  datumList,
  offerer: { address: BaseAddress, utxos: [] },
  owner: { address: BaseAddress, utxos: [] },
  bundleUtxo,
  offerUtxo,
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = owner.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const offerDatum = serializeOffer(datumOffer);
    const listDatum = serializeList(datumList);
    datums.add(offerDatum);
    datums.add(listDatum);

    const assets = [];
    for (let i = 0; i < datumOffer.offTokens.length; i++) {
      assets.push({
        unit: `${datumOffer.offTokens[i][0]}${datumOffer.offTokens[i][1]}`,
        quantity: "1",
      })
    };
    assets.push({ unit: "lovelace", quantity: "2900000" });

    outputs.add(
      createTxOutput(
        offerer.address.to_address(),
        assetsToValue(assets)
      )
    );

    outputs.add(
      createTxOutput(
        owner.address.to_address(),
        assetsToValue([{ unit: "lovelace", quantity: "1100000" }])
      )
    );


    const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
    requiredSigners.add(owner.address.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const txHash = await finalizeTx({
      txBuilder,
      utxos,
      outputs,
      datums,
      changeAddress: owner.address,
      assetUtxo: bundleUtxo,
      assetUtxo2: offerUtxo,
      plutusScripts: contractScripts(version),
      action: REFUSE,
      action2: REFUSE,
    });

    return txHash;
  } catch (error) {
    handleError(error, "refuseOffer");
  }
};

export const acceptOffer = async (
  datumOffer,
  datumList,
  offerer: { address: BaseAddress, utxos: [] },
  owner: { address: BaseAddress, utxos: [] },
  market: { address: BaseAddress, utxos: [] },
  bundleUtxo,
  offerUtxo,
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = owner.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const offerDatum = serializeOffer(datumOffer);
    const listDatum = serializeList(datumList);
    datums.add(offerDatum);
    datums.add(listDatum);

    const offer = [];
    for (let i = 0; i < datumOffer.offTokens.length; i++) {
      offer.push({
        unit: `${datumOffer.offTokens[i][0]}${datumOffer.offTokens[i][1]}`,
        quantity: "1",
      })
    };
    offer.push({ unit: "lovelace", quantity: "2000000" });

    outputs.add(
      createTxOutput(
        owner.address.to_address(),
        assetsToValue(offer)
      )
    );

    const bundle = [];
    for (let i = 0; i < datumOffer.cstns.length; i++) {
      bundle.push({
        unit: `${datumOffer.cstns[i][0]}${datumOffer.cstns[i][1]}`,
        quantity: "1",
      })
    };
    bundle.push({ unit: "lovelace", quantity: "2000000" });

    outputs.add(
      createTxOutput(
        offerer.address.to_address(),
        assetsToValue(bundle)
      )
    );

    outputs.add(
      createTxOutput(
        market.address.to_address(),
        assetsToValue([{ unit: "lovelace", quantity: "4000000" }])
      )
    );


    const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
    requiredSigners.add(owner.address.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const accept = index => ACCEPT(datumOffer.offTokens, index)

    const txHash = await finalizeTx({
      txBuilder,
      utxos,
      outputs,
      datums,
      changeAddress: owner.address,
      assetUtxo: bundleUtxo,
      assetUtxo2: offerUtxo,
      plutusScripts: contractScripts(version),
      action: accept,
      action2: accept
    });

    return txHash;
  } catch (error) {
    handleError(error, "acceptOffer");
  }
};

export const cancelBundle = async (
  datum,
  owner: { address: BaseAddress, utxos: [] },
  offerUtxo,
  version
) => {
  try {
    const { txBuilder, datums, outputs } = initializeTx();
    const utxos = owner.utxos.map((utxo) => serializeTxUnspentOutput(utxo));

    const cancelListingDatum = serializeList(datum);
    datums.add(cancelListingDatum);

    outputs.add(
      createTxOutput(owner.address.to_address(), offerUtxo.output().amount())
    );

    const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
    requiredSigners.add(owner.address.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

    const txHash = await finalizeTx({
      txBuilder,
      datums,
      utxos,
      outputs,
      changeAddress: owner.address,
      offerUtxo,
      plutusScripts: contractScripts(version),
      action: CANCEL,
    });

    return txHash;
  } catch (error) {
    handleError(error, "cancelBundle");
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
      if (error.message.search("NonOutputSupplimentaryDatums") !== -1) {
        throw new Error(ErrorTypes.TRANSACTION_FAILED_DATUMS_NOT_MATCHING);
      } else if (error.message.search("MissingScriptWitnessesUTXOW") !== -1) {
        throw new Error(ErrorTypes.TRANSACTION_FAILED_WRONG_SCRIPT_CONTRACT);
      } else if (error.message.search("OutputTooSmallUTxO") !== -1) {
        throw new Error(ErrorTypes.TRANSACTION_FAILED_ASSET_NOT_SPENDABLE);
      }
      throw error;
  }
};

