import Cardano from "../serialization-lib";
import { getCollateral, signTx, submitTx } from "../wallet";
import { getProtocolParameters } from "../blockfrost-api";
import CoinSelection from "./coinSelection";
import { languageViews } from "./languageViews";
import { fromHex, toHex } from "../../utils";

const DATUM_LABEL = 405;
const ADDRESS_LABEL = 406;
const CARDANO = Cardano.Instance;
const PROTOCOL_PARAMETERS = getProtocolParameters();

export const initializeTx = () => {
  const metadata = { [DATUM_LABEL]: {}, [ADDRESS_LABEL]: {} };

  const txBuilder = CARDANO.TransactionBuilder.new(
    CARDANO.LinearFee.new(
      CARDANO.BigNum.from_str(PROTOCOL_PARAMETERS.linearFee.minFeeA),
      CARDANO.BigNum.from_str(PROTOCOL_PARAMETERS.linearFee.minFeeB)
    ),
    CARDANO.BigNum.from_str(PROTOCOL_PARAMETERS.minUtxo),
    CARDANO.BigNum.from_str(PROTOCOL_PARAMETERS.poolDeposit),
    CARDANO.BigNum.from_str(PROTOCOL_PARAMETERS.keyDeposit),
    PROTOCOL_PARAMETERS.maxValSize,
    PROTOCOL_PARAMETERS.maxTxSize,
    PROTOCOL_PARAMETERS.priceMem,
    PROTOCOL_PARAMETERS.priceStep,
    CARDANO.LanguageViews.new(Buffer.from(languageViews, "hex"))
  );

  const datums = CARDANO.PlutusList.new();

  const outputs = CARDANO.TransactionOutputs.new();

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
  const transactionWitnessSet = CARDANO.TransactionWitnessSet.new();

  CoinSelection.setProtocolParameters(
    PROTOCOL_PARAMETERS.minUtxo,
    PROTOCOL_PARAMETERS.linearFee.minFeeA,
    PROTOCOL_PARAMETERS.linearFee.minFeeB,
    PROTOCOL_PARAMETERS.maxTxSize.toString()
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
    const redeemers = CARDANO.Redeemers.new();
    const redeemerIndex = txBuilder
      .index_of_input(scriptUtxo.input())
      .toString();
    redeemers.add(action(redeemerIndex));
    txBuilder.set_redeemers(CARDANO.Redeemers.from_bytes(redeemers.to_bytes()));
    txBuilder.set_plutus_data(CARDANO.PlutusList.from_bytes(datums.to_bytes()));
    txBuilder.set_plutus_scripts(plutusScripts);
    const collateral = (await getCollateral()).map((utxo) =>
      CARDANO.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );

    setCollateral(txBuilder, collateral);

    transactionWitnessSet.set_plutus_scripts(plutusScripts);
    transactionWitnessSet.set_plutus_data(datums);
    transactionWitnessSet.set_redeemers(redeemers);
  }

  let aux_data;

  if (metadata) {
    aux_data = CARDANO.AuxiliaryData.new();
    const generalMetadata = CARDANO.GeneralTransactionMetadata.new();
    Object.keys(metadata).forEach((label) => {
      Object.keys(metadata[label]).length > 0 &&
        generalMetadata.insert(
          CARDANO.BigNum.from_str(label),
          CARDANO.encode_json_str_to_metadatum(
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
    change.to_bytes().length * 2 > PROTOCOL_PARAMETERS.maxValSize
  ) {
    const partialChange = CARDANO.Value.new(CARDANO.BigNum.from_str("0"));

    const partialMultiAssets = CARDANO.MultiAsset.new();
    const policies = changeMultiAssets.keys();
    const makeSplit = () => {
      for (let j = 0; j < changeMultiAssets.len(); j++) {
        const policy = policies.get(j);
        const policyAssets = changeMultiAssets.get(policy);
        const assetNames = policyAssets.keys();
        const assets = CARDANO.Assets.new();
        for (let k = 0; k < assetNames.len(); k++) {
          const policyAsset = assetNames.get(k);
          const quantity = policyAssets.get(policyAsset);
          assets.insert(policyAsset, quantity);
          //check size
          const checkMultiAssets = CARDANO.MultiAsset.from_bytes(
            partialMultiAssets.to_bytes()
          );
          checkMultiAssets.insert(policy, assets);
          const checkValue = CARDANO.Value.new(CARDANO.BigNum.from_str("0"));
          checkValue.set_multiasset(checkMultiAssets);
          if (
            checkValue.to_bytes().length * 2 >=
            PROTOCOL_PARAMETERS.maxValSize
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
    const minAda = CARDANO.min_ada_required(
      partialChange,
      CARDANO.BigNum.from_str(PROTOCOL_PARAMETERS.minUtxo)
    );
    partialChange.set_coin(minAda);

    txBuilder.add_output(
      CARDANO.TransactionOutput.new(changeAddress.to_address(), partialChange)
    );
  }

  txBuilder.add_change_if_needed(changeAddress.to_address());

  const txBody = txBuilder.build();

  const tx = CARDANO.Transaction.new(
    txBody,
    CARDANO.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
    aux_data
  );

  const size = tx.to_bytes().length * 2;

  if (size > PROTOCOL_PARAMETERS.maxTxSize) throw new Error("MAX_SIZE_REACHED");

  let txVkeyWitnesses = await signTx(toHex(tx.to_bytes()), true);
  txVkeyWitnesses = CARDANO.TransactionWitnessSet.from_bytes(
    fromHex(txVkeyWitnesses)
  );

  transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

  const signedTx = CARDANO.Transaction.new(
    tx.body(),
    transactionWitnessSet,
    tx.auxiliary_data()
  );

  const txHash = await submitTx(toHex(signedTx.to_bytes()));

  return txHash;
};

export const createOutput = (
  address,
  value,
  { datum, index, tradeOwnerAddress, metadata } = {}
) => {
  const v = value;

  const minAda = CARDANO.min_ada_required(
    v,
    CARDANO.BigNum.from_str(PROTOCOL_PARAMETERS.minUtxo),
    datum && CARDANO.hash_plutus_data(datum)
  );

  if (minAda.compare(v.coin()) === 1) v.set_coin(minAda);

  const output = CARDANO.TransactionOutput.new(address, v);

  if (datum) {
    output.set_data_hash(CARDANO.hash_plutus_data(datum));
    metadata[DATUM_LABEL][index] = "0x" + toHex(datum.to_bytes());
  }

  if (tradeOwnerAddress) {
    metadata[ADDRESS_LABEL].address =
      "0x" + toHex(tradeOwnerAddress.to_address().to_bytes());
  }

  return output;
};

export const getTransactionUnspentOutputHash = (hexEncodedBytes) => {
  return CARDANO.Ed25519KeyHash.from_bytes(
    CARDANO.TransactionUnspentOutput.from_bytes(
      fromHex(hexEncodedBytes)
    ).to_bytes()
  );
};

const setCollateral = (txBuilder, utxos) => {
  const inputs = CARDANO.TransactionInputs.new();

  utxos.forEach((utxo) => {
    inputs.add(utxo.input());
  });

  txBuilder.set_collateral(inputs);
};
