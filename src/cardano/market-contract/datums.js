import Cardano from "../serialization-lib";
import { fromHex, toHex } from "../../utils";

export const serializeSale = ({ tn, cs, sa, ra, rp, price }) => {
  const fields = Cardano.Instance.PlutusList.new();

  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(sa)));
  fields.add(
    Cardano.Instance.PlutusData.new_integer(
      Cardano.Instance.BigInt.from_str(`${price}`)
    )
  );
  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(cs)));
  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(tn)));
  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(ra)));
  fields.add(
    Cardano.Instance.PlutusData.new_integer(
      Cardano.Instance.BigInt.from_str(`${rp}`)
    )
  );

  const datum = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(0),
      fields
    )
  );

  return datum;
};

export const deserializeSale = (datum) => {
  const details = datum.as_constr_plutus_data().data();

  return {
    tn: toHex(details.get(3).as_bytes()),
    cs: toHex(details.get(2).as_bytes()),
    sa: toHex(details.get(0).as_bytes()),
    ra: toHex(details.get(4).as_bytes()),
    rp: details.get(5).as_integer().to_str(),
    price: details.get(1).as_integer().to_str(),
  };
};

export const serializeUpdate = ({ vh }) => {
  const fieldsNested = Cardano.Instance.PlutusList.new();

  fieldsNested.add(Cardano.Instance.PlutusData.new_bytes(fromHex(vh)));

  const fields = Cardano.Instance.PlutusList.new();

  fields.add(
    Cardano.Instance.PlutusData.new_constr_plutus_data(
      Cardano.Instance.ConstrPlutusData.new(
        Cardano.Instance.Int.new_i32(0),
        fieldsNested
      )
    )
  );

  const datum = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(0),
      fields
    )
  );

  return datum;
};
