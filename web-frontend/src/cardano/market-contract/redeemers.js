import Cardano from "../serialization-lib";

const CARDANO = Cardano.Instance();

export const BUY = (index) => {
  const redeemerData = CARDANO.PlutusData.new_constr_plutus_data(
    CARDANO.ConstrPlutusData.new(
      CARDANO.Int.new_i32(0),
      CARDANO.PlutusList.new()
    )
  );
  const redeemer = CARDANO.Redeemer.new(
    CARDANO.RedeemerTag.new_spend(),
    CARDANO.BigNum.from_str(index),
    redeemerData,
    CARDANO.ExUnits.new(
      CARDANO.BigNum.from_str("7000000"),
      CARDANO.BigNum.from_str("3000000000")
    )
  );
  return redeemer;
};
