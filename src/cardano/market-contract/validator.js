import Cardano from "../serialization-lib";
import Contracts from "./plutus";
import { fromHex } from "../../utils/converter";

export const contractAddress = (version) => {
  return Cardano.Instance.Address.from_bech32(Contracts[version].address);
};

export const contractScripts = (version) => {
  const scripts = Cardano.Instance.PlutusScripts.new();

  scripts.add(Cardano.Instance.PlutusScript.new(fromHex(Contracts[version].cborHex)));

  return scripts;
};
