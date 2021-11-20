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
import { getUsedAddress, getUtxos } from "../wallet";
import { fromHex, toHex, toLovelace } from "../../utils";

export const offer = async (tn, cs, price) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    await getUsedAddress()
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const raddr = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(
      "addr_test1qrm4m0p8nn9mxsgzu8dejtf2glqz0k556tac34tpw40zefllt9l9jhn3tlkatyue3w4f47zhgscu7y5mpzdtdh7d7qwquyes0x"
    )
  );
  const rp = 3;

  const offerDatum = serializeSale({
    tn,
    cs,
    sa: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
    price: price,
    ra: toHex(raddr.payment_cred().to_keyhash().to_bytes()),
    rp,
  });
  
  datums.add(offerDatum);

  outputs.add(
    await createTxOutput(
      contractAddress(),
      assetsToValue([
        {
          unit: `${cs}${tn}`,
          quantity: "1",
        },
        { unit: "lovelace", quantity: "2000000" },
      ]),
      { datum: offerDatum }
    )
  );

  const datumHash = toHex(Cardano.Instance.hash_plutus_data(offerDatum).to_bytes());
  const txHash = await finalizeTx({
    txBuilder,
    datums,
    utxos,
    outputs,
    changeAddress: walletAddress,
  });

  return {
    datumHash,
    txHash,
  };
};

export const update = async (tn, cs, price, newprice, assetUtxos) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    await getUsedAddress()
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const raddr = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(
      "addr_test1qrm4m0p8nn9mxsgzu8dejtf2glqz0k556tac34tpw40zefllt9l9jhn3tlkatyue3w4f47zhgscu7y5mpzdtdh7d7qwquyes0x"
    )
  );
  const rp = 3;

  const updateDatum = serializeSale({
    tn,
    cs,
    sa: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
    price: price,
    ra: toHex(raddr.payment_cred().to_keyhash().to_bytes()),
    rp,
  });

  const updateDatumNew = serializeSale({
    tn,
    cs,
    sa: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
    price: newprice,
    ra: toHex(raddr.payment_cred().to_keyhash().to_bytes()),
    rp,
  });

  datums.add(updateDatum);
  datums.add(updateDatumNew);

  const assetUtxo = assetUtxos.filter(
    (utxo) =>
      toHex(Cardano.Instance.hash_plutus_data(updateDatum).to_bytes()) ===
      utxo.data_hash
  )[0];

  const scriptUtxo = createTxUnspentOutput(assetUtxo);

  outputs.add(
    await createTxOutput(contractAddress(), scriptUtxo.output().amount(), {
      datum: updateDatumNew,
    })
  );

  const requiredSigners = Cardano.Instance.Ed25519KeyHashes.new();
  requiredSigners.add(walletAddress.payment_cred().to_keyhash());
  txBuilder.set_required_signers(requiredSigners);

  const datumHash = toHex(Cardano.Instance.hash_plutus_data(updateDatumNew).to_bytes());
  const txHash = await finalizeTx({
    txBuilder,
    datums,
    utxos,
    outputs,
    changeAddress: walletAddress,
    scriptUtxo,
    plutusScripts: contractScripts(),
    action: UPDATE,
  });

  return {
    datumHash,
    txHash,
  };
};

export const cancel = async (tn, cs, price, assetUtxos) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    await getUsedAddress()
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const raddr = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(
      "addr_test1qrm4m0p8nn9mxsgzu8dejtf2glqz0k556tac34tpw40zefllt9l9jhn3tlkatyue3w4f47zhgscu7y5mpzdtdh7d7qwquyes0x"
    )
  );
  const rp = 3;

  const cancelDatum = serializeSale({
    tn,
    cs,
    sa: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
    price: price,
    ra: toHex(raddr.payment_cred().to_keyhash().to_bytes()),
    rp,
  });

  datums.add(cancelDatum);

  const assetUtxo = assetUtxos.filter(
    (utxo) =>
      toHex(Cardano.Instance.hash_plutus_data(cancelDatum).to_bytes()) ===
      utxo.data_hash
  )[0];

  const scriptUtxo = createTxUnspentOutput(assetUtxo);

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
    plutusScripts: contractScripts(),
    action: CANCEL,
  });

  return txHash;
};

export const purchase = async (tn, cs, sa, price, assetUtxos) => {
  const { txBuilder, datums, outputs } = await initializeTx();

  const walletAddress = Cardano.Instance.BaseAddress.from_address(
    await getUsedAddress()
  );

  const utxos = (await getUtxos()).map((utxo) =>
    Cardano.Instance.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const sellerAddress = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(sa)
  );

  const feeaddr = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(
      "addr_test1qp6pykcc0kgaqj27z3jg4sjt7768p375qr8q4z3f4xdmf38skpyf2kgu5wqpnm54y5rqgee4uwyksg6eyd364qhmpwqsv2jjt3"
    )
  );

  const raddr = Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(
      "addr_test1qrm4m0p8nn9mxsgzu8dejtf2glqz0k556tac34tpw40zefllt9l9jhn3tlkatyue3w4f47zhgscu7y5mpzdtdh7d7qwquyes0x"
    )
  );
  const rp = 3;

  const purchaseDatum = serializeSale({
    tn,
    cs,
    sa: toHex(sellerAddress.payment_cred().to_keyhash().to_bytes()),
    price: price,
    ra: toHex(raddr.payment_cred().to_keyhash().to_bytes()),
    rp,
  });

  datums.add(purchaseDatum);

  const assetUtxo = assetUtxos.filter(
    (utxo) =>
      toHex(Cardano.Instance.hash_plutus_data(purchaseDatum).to_bytes()) ===
      utxo.data_hash
  )[0];

  const scriptUtxo = createTxUnspentOutput(assetUtxo);

  outputs.add(
    await createTxOutput(
      walletAddress.to_address(),
      scriptUtxo.output().amount()
    )
  );

  var sellerOut =
    price -
    0.02 * price -
    (rp / 100) * price;
  if (sellerOut <= 1600000) {
    sellerOut = 1600000;
  }
  var feeOut = 0.02 * price;
  if (feeOut <= 1600000) {
    feeOut = 1600000;
  }
  var royOut = (rp / 100) * price;
  if (royOut <= 1600000) {
    royOut = 1600000;
  }

  outputs.add(
    await createTxOutput(
      sellerAddress.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${sellerOut}` }])
    )
  );

  outputs.add(
    await createTxOutput(
      raddr.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${royOut}` }])
    )
  );

  outputs.add(
    await createTxOutput(
      feeaddr.to_address(),
      assetsToValue([{ unit: "lovelace", quantity: `${feeOut}` }])
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
    plutusScripts: contractScripts(),
    action: BUY,
  });
  return txHash;
};
