import Cardano from "../serialization-lib";

export const BUY = (index) => {
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

export const CANCEL = (index) => {
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

export const UPDATE = (index) => {
  const data = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(1),
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
