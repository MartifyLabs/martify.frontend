import Cardano from "../serialization-lib";
import CoinSelection from "./coinSelection";
import ErrorTypes from "./error.types";
import { languageViews } from "./languageViews";
import { getCollateral, signTx, submitTx } from "../wallet";
import { fromHex, toHex } from "../../utils";

export const assetsToValue = (assets) => {
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
        Cardano.Instance.AssetName.new(fromHex(asset.unit.slice(56))),
        Cardano.Instance.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Cardano.Instance.ScriptHash.from_bytes(fromHex(policy)),
      assetsValue
    );
  });
  const value = Cardano.Instance.Value.new(
    Cardano.Instance.BigNum.from_str(lovelace ? lovelace.quantity : "0")
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
};

export const initializeTx = () => {
  const metadata = {};

  const Parameters = getProtocolParameters();

  const txBuilder = Cardano.Instance.TransactionBuilder.new(
    Cardano.Instance.LinearFee.new(
      Cardano.Instance.BigNum.from_str(Parameters.linearFee.minFeeA),
      Cardano.Instance.BigNum.from_str(Parameters.linearFee.minFeeB)
    ),
    Cardano.Instance.BigNum.from_str(Parameters.minUtxo),
    Cardano.Instance.BigNum.from_str(Parameters.poolDeposit),
    Cardano.Instance.BigNum.from_str(Parameters.keyDeposit),
    Parameters.maxValSize,
    Parameters.maxTxSize,
    Parameters.priceMem,
    Parameters.priceStep,
    Cardano.Instance.LanguageViews.new(fromHex(languageViews))
  );

  const datums = Cardano.Instance.PlutusList.new();

  const outputs = Cardano.Instance.TransactionOutputs.new();

  return { metadata, txBuilder, datums, outputs };
};

export const finalizeTx = async ({
  txBuilder,
  changeAddress,
  utxos,
  outputs,
  datums,
  metadata,
  scriptUtxo,
  action,
  plutusScripts,
}) => {
  const Parameters = getProtocolParameters();
  const transactionWitnessSet = Cardano.Instance.TransactionWitnessSet.new();

  CoinSelection.setProtocolParameters(
    Parameters.minUtxo,
    Parameters.linearFee.minFeeA,
    Parameters.linearFee.minFeeB,
    Parameters.maxTxSize.toString()
  );

  let { input, change } = CoinSelection.randomImprove(
    utxos,
    outputs,
    8,
    scriptUtxo ? [scriptUtxo] : []
  );

  input.forEach((utxo) => {
    txBuilder.add_input(
      utxo.output().address(),
      utxo.input(),
      utxo.output().amount()
    );
  });

  for (let i = 0; i < outputs.len(); i++) {
    txBuilder.add_output(outputs.get(i));
  }

  if (scriptUtxo) {
    const redeemers = Cardano.Instance.Redeemers.new();
    const redeemerIndex = txBuilder
      .index_of_input(scriptUtxo.input())
      .toString();
    redeemers.add(action(redeemerIndex));
    txBuilder.set_redeemers(
      Cardano.Instance.Redeemers.from_bytes(redeemers.to_bytes())
    );
    txBuilder.set_plutus_data(
      Cardano.Instance.PlutusList.from_bytes(datums.to_bytes())
    );
    txBuilder.set_plutus_scripts(plutusScripts);
    const collateral = (await getCollateral()).map((utxo) =>
      Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );

    setCollateral(txBuilder, collateral);

    transactionWitnessSet.set_plutus_scripts(plutusScripts);
    transactionWitnessSet.set_plutus_data(datums);
    transactionWitnessSet.set_redeemers(redeemers);
  }

  let aux_data;

  if (metadata) {
    aux_data = Cardano.Instance.AuxiliaryData.new();
    const generalMetadata = Cardano.Instance.GeneralTransactionMetadata.new();
    generalMetadata.insert(
      Cardano.Instance.BigNum.from_str("100"),
      Cardano.Instance.encode_json_str_to_metadatum(JSON.stringify(metadata), 1)
    );

    aux_data.set_metadata(generalMetadata);
    txBuilder.set_auxiliary_data(aux_data);
  }

  const changeMultiAssets = change.multiasset();

  // check if change value is too big for single output
  if (
    changeMultiAssets &&
    change.to_bytes().length * 2 > Parameters.maxValSize
  ) {
    const partialChange = Cardano.Instance.Value.new(
      Cardano.Instance.BigNum.from_str("0")
    );

    const partialMultiAssets = Cardano.Instance.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    const makeSplit = () => {
      for (let j = 0; j < changeMultiAssets.len(); j++) {
        const policy = policies.get(j);
        const policyAssets = changeMultiAssets.get(policy);
        const assetNames = policyAssets.keys();
        const assets = Cardano.Instance.Assets.new();
        for (let k = 0; k < assetNames.len(); k++) {
          const policyAsset = assetNames.get(k);
          const quantity = policyAssets.get(policyAsset);
          assets.insert(policyAsset, quantity);
          //check size
          const checkMultiAssets = Cardano.Instance.MultiAsset.from_bytes(
            partialMultiAssets.to_bytes()
          );
          checkMultiAssets.insert(policy, assets);
          const checkValue = Cardano.Instance.Value.new(
            Cardano.Instance.BigNum.from_str("0")
          );
          checkValue.set_multiasset(checkMultiAssets);
          if (checkValue.to_bytes().length * 2 >= Parameters.maxValSize) {
            partialMultiAssets.insert(policy, assets);
            return;
          }
        }
        partialMultiAssets.insert(policy, assets);
      }
    };
    makeSplit();
    partialChange.set_multiasset(partialMultiAssets);
    const minAda = Cardano.Instance.min_ada_required(
      partialChange,
      Cardano.Instance.BigNum.from_str(Parameters.minUtxo)
    );
    partialChange.set_coin(minAda);

    txBuilder.add_output(
      Cardano.Instance.TransactionOutput.new(
        changeAddress.to_address(),
        partialChange
      )
    );
  }

  txBuilder.add_change_if_needed(changeAddress.to_address());

  const txBody = txBuilder.build();

  const tx = Cardano.Instance.Transaction.new(
    txBody,
    Cardano.Instance.TransactionWitnessSet.from_bytes(
      transactionWitnessSet.to_bytes()
    ),
    aux_data
  );

  const size = tx.to_bytes().length * 2;
  if (size > Parameters.maxTxSize) throw new Error(ErrorTypes.MAX_SIZE_REACHED);

  let txVkeyWitnesses = await signTx(toHex(tx.to_bytes()), true);
  txVkeyWitnesses = Cardano.Instance.TransactionWitnessSet.from_bytes(
    fromHex(txVkeyWitnesses)
  );

  transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

  const signedTx = Cardano.Instance.Transaction.new(
    tx.body(),
    transactionWitnessSet,
    tx.auxiliary_data()
  );

  const txHash = await submitTx(toHex(signedTx.to_bytes()));

  return txHash;
};

export const createTxOutput = (address, value, { datum } = {}) => {
  const minAda = Cardano.Instance.min_ada_required(
    value,
    Cardano.Instance.BigNum.from_str(getProtocolParameters().minUtxo),
    datum && Cardano.Instance.hash_plutus_data(datum)
  );

  if (minAda.compare(value.coin()) === 1) value.set_coin(minAda);

  const output = Cardano.Instance.TransactionOutput.new(address, value);

  if (datum) {
    output.set_data_hash(Cardano.Instance.hash_plutus_data(datum));
  }

  return output;
};

/**
 * @throws COULD_NOT_CREATE_TRANSACTION_UNSPENT_OUTPUT
 */
export const createTxUnspentOutput = (address, utxo) => {
  try {
    return Cardano.Instance.TransactionUnspentOutput.new(
      Cardano.Instance.TransactionInput.new(
        Cardano.Instance.TransactionHash.from_bytes(fromHex(utxo.tx_hash)),
        utxo.output_index
      ),
      Cardano.Instance.TransactionOutput.new(
        address,
        assetsToValue(utxo.amount)
      )
    );
  } catch (error) {
    console.error(
      `Unexpected error in createTxUnspentOutput. [Message: ${error.message}]`
    );
    throw new Error(ErrorTypes.COULD_NOT_CREATE_TRANSACTION_UNSPENT_OUTPUT);
  }
};

/**
 * @throws COULD_NOT_SERIALIZE_TRANSACTION_UNSPENT_OUTPUT
 */
export const serializeTxUnspentOutput = (hexEncodedBytes) => {
  try {
    return Cardano.Instance.TransactionUnspentOutput.from_bytes(
      fromHex(hexEncodedBytes)
    );
  } catch (error) {
    console.error(
      `Unexpected error in serializeTxUnspentOutput. [Message: ${error.message}]`
    );
    throw new Error(ErrorTypes.COULD_NOT_SERIALIZE_TRANSACTION_UNSPENT_OUTPUT);
  }
};

export const valueToAssets = (value) => {
  const assets = [];
  assets.push({ unit: "lovelace", quantity: value.coin().to_str() });
  if (value.multiasset()) {
    const multiAssets = value.multiasset().keys();
    for (let j = 0; j < multiAssets.len(); j++) {
      const policy = multiAssets.get(j);
      const policyAssets = value.multiasset().get(policy);
      const assetNames = policyAssets.keys();
      for (let k = 0; k < assetNames.len(); k++) {
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        const asset = toHex(policy.to_bytes()) + toHex(policyAsset.name());
        assets.push({
          unit: asset,
          quantity: quantity.to_str(),
        });
      }
    }
  }
  return assets;
};

const getProtocolParameters = () => {
  return {
    linearFee: {
      minFeeA: "44",
      minFeeB: "155381",
    },
    minUtxo: "34482",
    poolDeposit: "500000000",
    keyDeposit: "2000000",
    maxValSize: 5000,
    maxTxSize: 16384,
    priceMem: 0.0577,
    priceStep: 0.0000721,
  };
};

const setCollateral = (txBuilder, utxos) => {
  const inputs = Cardano.Instance.TransactionInputs.new();

  utxos.forEach((utxo) => {
    inputs.add(utxo.input());
  });

  txBuilder.set_collateral(inputs);
};
