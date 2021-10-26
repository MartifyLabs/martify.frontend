import Cardano from "../serialization-lib";
import { MARKET } from "./datums";
import { finalizeTx, initializeTx } from "../transaction";
import { getUsedAddresses, getUtxos } from "../wallet";
import { contractHex } from "./script";
import { fromAscii, fromHex, toHex } from "../../utils";

const CARDANO = Cardano.Instance();

export const buyToken = async (offerUtxo) => {
  const { txBuilder, datums, metadata, outputs } = await initializeTx();

  budId = budId.toString();
  if (
    CARDANO.BigNum.from_str(requestedAmount).compare(contractInfo.minPrice) ===
    -1
  )
    throw new Error("Amount too small");

  const sellerAddress = "";

  const utxos = (await getUtxos()).map((utxo) =>
    CARDANO.TransactionUnspentOutput.from_bytes(fromHex(utxo))
  );

  const marketDatum = MARKET({
    tn,
    cs,
    price,
    sellerAddress: toHex(sellerAddress.payment_cred().to_keyhash().to_bytes()),
  });
  outputs.add(
    createOutput(
      contractAddress(),
      assetsToValue([
        {
          unit:
            contractInfo.policySpaceBudz +
            fromAscii(contractInfo.prefixSpaceBud + budId),
          quantity: "1",
        },
      ]),
      {
        datum: marketDatum,
        index: 0,
        tradeOwnerAddress: walletAddress,
        metadata,
      }
    )
  );

  datums.add(marketDatum);

  const txHash = await finalizeTx({
    txBuilder,
    changeAddress: walletAddress,
    utxos,
    outputs,
    datums,
    metadata,
    plutusScripts: contractScripts(),
  });

  return txHash;
};

export const contractAddress = () => {
  CARDANO.Address.from_bech32(
    "addr_test1wq2m8ul5twkj8c0mc2nyxgr8ylk2u07rj882hs90a5yrhzgwgatvu"
  );
};

export const contractScripts = () => {
  const scripts = CARDANO.PlutusScripts.new();

  scripts.add(CARDANO.PlutusScript.new(fromHex(contractHex)));

  return scripts;
};
