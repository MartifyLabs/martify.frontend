import CardanoInstance from "../serialization-lib";
import { fromHex, toHex } from "../../utils";

export const serialize = async ({ tn, cs, sellerAddress, price }) => {
  const instance = await CardanoInstance;
  const fields = instance.PlutusList.new();

  fields.add(instance.PlutusData.new_bytes(fromHex(tn)));
  fields.add(instance.PlutusData.new_bytes(fromHex(cs)));
  fields.add(instance.PlutusData.new_bytes(fromHex(sellerAddress)));
  fields.add(instance.PlutusData.new_integer(instance.BigInt.from_str(price)));

  const datum = instance.PlutusData.new_constr_plutus_data(
    instance.ConstrPlutusData.new(instance.Int.new_i32(0), fields)
  );

  return datum;
};

export const deserialize = async (datum) => {
  const instance = await CardanoInstance;
  const details = datum.as_constr_plutus_data().data();

  return {
    tn: toHex(details.get(0).as_bytes()),
    cs: toHex(details.get(1).as_bytes()),
    sellerAddress: toHex(
      instance.Ed25519KeyHash.from_bytes(details.get(2).as_bytes())
    ),
    price: details.get(3).as_integer().as_u64(),
  };
};
