import Cardano from "../serialization-lib";
import { cborHex } from "./plutus";
import { fromHex } from "../../utils";

export const contractAddress = () => {
  return Cardano.Instance.Address.from_bech32(
    "addr_test1wqmmvr9h6mxgdm5q8s9c0rrwfkskwvrlkshzu6sqhsszxvc47g4d8"
  );
};

export const contractScripts = () => {
  const scripts = Cardano.Instance.PlutusScripts.new();

  scripts.add(Cardano.Instance.PlutusScript.new(fromHex(cborHex)));

  return scripts;
};
