import Cardano from "../serialization-lib";
import { getCollateral, signTx, submitTx } from "../wallet";
import { getProtocolParameters } from "../blockfrost-api";
import CoinSelection from "./coinSelection";
import { languageViews } from "./languageViews";
import { fromHex, toHex } from "../../utils";

const DATUM_LABEL = 405;
const ADDRESS_LABEL = 406;

export const initializeTx = async () => {
  await Cardano.load();
  const Parameters = await getProtocolParameters();
  const metadata = { [DATUM_LABEL]: {}, [ADDRESS_LABEL]: {} };

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
    Cardano.Instance.LanguageViews.new(Buffer.from(languageViews, "hex"))
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
  await Cardano.load();
  const Parameters = await getProtocolParameters();
  const transactionWitnessSet = Cardano.Instance.TransactionWitnessSet.new();

  CoinSelection.setProtocolParameters(
    Parameters.minUtxo,
    Parameters.linearFee.minFeeA,
    Parameters.linearFee.minFeeB,
    Parameters.maxTxSize.toString()
  );

  let { input, change } = await CoinSelection.randomImprove(
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
    Object.keys(metadata).forEach((label) => {
      Object.keys(metadata[label]).length > 0 &&
        generalMetadata.insert(
          Cardano.Instance.BigNum.from_str(label),
          Cardano.Instance.encode_json_str_to_metadatum(
            JSON.stringify(metadata[label]),
            1
          )
        );
    });
    aux_data.set_metadata(generalMetadata);
    txBuilder.set_auxiliary_data(aux_data);
  }

  const changeMultiAssets = change.multiasset();

  // check if change value is too big for single output
  if (
    changeMultiAssets &&
    change.to_bytes().length * 2 > Parameters.maxValSize
  ) {
    const partialChange = Cardano.Instance.Value.new(Cardano.Instance.BigNum.from_str("0"));

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
          const checkValue = Cardano.Instance.Value.new(Cardano.Instance.BigNum.from_str("0"));
          checkValue.set_multiasset(checkMultiAssets);
          if (
            checkValue.to_bytes().length * 2 >=
            Parameters.maxValSize
          ) {
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
      Cardano.Instance.TransactionOutput.new(changeAddress.to_address(), partialChange)
    );
  }

  txBuilder.add_change_if_needed(changeAddress.to_address());

  const txBody = txBuilder.build();

  const tx = Cardano.Instance.Transaction.new(
    txBody,
    Cardano.Instance.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
    aux_data
  );

  const size = tx.to_bytes().length * 2;

  if (size > Parameters.maxTxSize) throw new Error("MAX_SIZE_REACHED");

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

export const createTxOutput = async (
  address,
  value,
  { datum, index, tradeOwnerAddress, metadata } = {}
) => {
  await Cardano.load();
  const Parameters = await getProtocolParameters();
  const v = value;

  const minAda = Cardano.Instance.min_ada_required(
    v,
    Cardano.Instance.BigNum.from_str(Parameters.minUtxo),
    datum && Cardano.Instance.hash_plutus_data(datum)
  );

  if (minAda.compare(v.coin()) === 1) v.set_coin(minAda);

  const output = Cardano.Instance.TransactionOutput.new(address, v);

  if (datum) {
    output.set_data_hash(Cardano.Instance.hash_plutus_data(datum));
    metadata[DATUM_LABEL][index] = "0x" + toHex(datum.to_bytes());
  }

  if (tradeOwnerAddress) {
    metadata[ADDRESS_LABEL].address =
      "0x" + toHex(tradeOwnerAddress.to_address().to_bytes());
  }

  return output;
};

export const getTxUnspentOutputHash = async (hexEncodedBytes) => {
  await Cardano.load();

  try {
    return toHex(
      Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(hexEncodedBytes))
        .input()
        .transaction_id()
        .to_bytes()
    );
  } catch (error) {
    console.error(
      `Unexpected error in getTxUnspentOutputHash. [Message: ${error.message}]`
    );
  }
};

const setCollateral = async (txBuilder, utxos) => {
  await Cardano.load();

  const inputs = Cardano.Instance.TransactionInputs.new();

  utxos.forEach((utxo) => {
    inputs.add(utxo.input());
  });

  txBuilder.set_collateral(inputs);
};
