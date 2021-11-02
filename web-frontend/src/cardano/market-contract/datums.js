import Cardano from "../serialization-lib";
import { fromHex, toHex } from "../../utils";

export const serialize = async ({ tn, cs, sellerAddress, price }) => {
  await Cardano.load();
  const fields = Cardano.Instance.PlutusList.new();

  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(tn)));
  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(cs)));
  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(sellerAddress)));
  fields.add(Cardano.Instance.PlutusData.new_integer(Cardano.Instance.BigInt.from_str(price)));

  const datum = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(Cardano.Instance.Int.new_i32(0), fields)
  );

  return datum;
};

export const deserialize = async (datum) => {
  await Cardano.load();
  const details = datum.as_constr_plutus_data().data();

  return {
    tn: toHex(details.get(0).as_bytes()),
    cs: toHex(details.get(1).as_bytes()),
    sellerAddress: toHex(
      Cardano.Instance.Ed25519KeyHash.from_bytes(details.get(2).as_bytes())
    ),
    price: details.get(3).as_integer().as_u64(),
  };
};
