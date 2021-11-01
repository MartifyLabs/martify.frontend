import CardanoInstance from "../serialization-lib";

export const BUY = async (index) => {
  const instance = await CardanoInstance;
  const data = instance.PlutusData.new_constr_plutus_data(
    instance.ConstrPlutusData.new(
      instance.Int.new_i32(0),
      instance.PlutusList.new()
    )
  );

  const redeemer = instance.Redeemer.new(
    instance.RedeemerTag.new_spend(),
    instance.BigNum.from_str(index),
    data,
    instance.ExUnits.new(
      instance.BigNum.from_str("7000000"),
      instance.BigNum.from_str("3000000000")
    )
  );

  return redeemer;
};

export const CANCEL = async (index) => {
  const instance = await CardanoInstance;
  const data = instance.PlutusData.new_constr_plutus_data(
    instance.ConstrPlutusData.new(
      instance.Int.new_i32(1),
      instance.PlutusList.new()
    )
  );

  const redeemer = instance.Redeemer.new(
    instance.RedeemerTag.new_spend(),
    instance.BigNum.from_str(index),
    data,
    instance.ExUnits.new(
      instance.BigNum.from_str("5000000"),
      instance.BigNum.from_str("2000000000")
    )
  );

  return redeemer;
};
