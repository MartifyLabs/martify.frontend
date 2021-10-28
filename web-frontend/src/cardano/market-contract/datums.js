import Cardano from "../serialization-lib";
import { fromHex, toHex } from "../../utils";

const CARDANO = Cardano.Instance;

export const serialize = ({ tn, cs, sellerAddress, price }) => {
  const fields = CARDANO.PlutusList.new();

  fields.add(CARDANO.PlutusData.new_bytes(fromHex(tn)));
  fields.add(CARDANO.PlutusData.new_bytes(fromHex(cs)));
  fields.add(CARDANO.PlutusData.new_bytes(fromHex(sellerAddress)));
  fields.add(CARDANO.PlutusData.new_integer(CARDANO.BigInt.from_str(price)));

  const datum = CARDANO.PlutusData.new_constr_plutus_data(
    CARDANO.ConstrPlutusData.new(CARDANO.Int.new_i32(0), fields)
  );

  return datum;
};

export const deserialize = (datum) => {
  const details = datum.as_constr_plutus_data().data();

  return {
    tn: toHex(details.get(0).as_bytes()),
    cs: toHex(details.get(1).as_bytes()),
    sellerAddress: toHex(
      CARDANO.Ed25519KeyHash.from_bytes(details.get(2).as_bytes())
    ),
    price: details.get(3).as_integer().as_u64(),
  };
};
