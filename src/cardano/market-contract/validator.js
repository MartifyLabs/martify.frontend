import Cardano from "../serialization-lib";
import Contract from "./plutus";
import { fromHex } from "../../utils/converter";

export const contractAddress = () => {
  return Cardano.Instance.Address.from_bech32(Contract.address);
};

export const contractScripts = () => {
  const scripts = Cardano.Instance.PlutusScripts.new();

  scripts.add(Cardano.Instance.PlutusScript.new(fromHex(Contract.cborHex)));

  return scripts;
};
