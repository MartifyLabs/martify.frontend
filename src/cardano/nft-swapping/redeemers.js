import Cardano from "../serialization-lib";
import { fromHex } from "../../utils/converter";

export const CANCEL = (index) => {
  const data = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(0),
      Cardano.Instance.PlutusList.new()
    )
  );

  const redeemer = Cardano.Instance.Redeemer.new(
    Cardano.Instance.RedeemerTag.new_spend(),
    Cardano.Instance.BigNum.from_str(index),
    data,
    Cardano.Instance.ExUnits.new(
      Cardano.Instance.BigNum.from_str("7000000"),
      Cardano.Instance.BigNum.from_str("3000000000")
    )
  );

  return redeemer;
};

export const ACCEPT = (index, offTokens) => { //offTokens is a list of tuples (PolicyId, TokenName)
  const fields = Cardano.Instance.PlutusList.new();
  const list = Cardano.Instance.PlutusList.new();

  for (let i = 0; i < offTokens.length; i++) {
    const fields_inner = Cardano.Instance.PlutusList.new();
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(offTokens[i][0])));
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(offTokens[i][1])));
    const tuple = Cardano.Instance.PlutusData.new_constr_plutus_data(
      Cardano.Instance.ConstrPlutusData.new(
        Cardano.Instance.Int.new_i32(0),
        fields_inner
      )
    )
    list.add(tuple);
  };

  fields.add(list);
  const data = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(1),
      fields
    )
  );

  const redeemer = Cardano.Instance.Redeemer.new(
    Cardano.Instance.RedeemerTag.new_spend(),
    Cardano.Instance.BigNum.from_str(index),
    data,
    Cardano.Instance.ExUnits.new(
      Cardano.Instance.BigNum.from_str("7000000"),
      Cardano.Instance.BigNum.from_str("3000000000")
    )
  );

  return redeemer;
};

export const REFUSE = (index) => {
  const data = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(2),
      Cardano.Instance.PlutusList.new()
    )
  );

  const redeemer = Cardano.Instance.Redeemer.new(
    Cardano.Instance.RedeemerTag.new_spend(),
    Cardano.Instance.BigNum.from_str(index),
    data,
    Cardano.Instance.ExUnits.new(
      Cardano.Instance.BigNum.from_str("7000000"),
      Cardano.Instance.BigNum.from_str("3000000000")
    )
  );

  return redeemer;
};
