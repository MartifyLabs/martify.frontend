import Cardano from "../serialization-lib";
import { fromHex } from "../../utils";

const CARDANO = Cardano.Instance();

export const MARKET = ({ tn, cs, sellerAddress, price }) => {
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
