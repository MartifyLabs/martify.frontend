import Cardano from "../serialization-lib";
import { cborHex } from "./plutus";
import { fromHex } from "../../utils";

export const contractAddress = () => {
  return Cardano.Instance.Address.from_bech32(
    "addr_test1wqvxeyeukkkt8j95jd6sv843weern7n650r3tmw0ukvcv8s786jjh"
  );
};

export const contractScripts = () => {
  const scripts = Cardano.Instance.PlutusScripts.new();

  scripts.add(Cardano.Instance.PlutusScript.new(fromHex(cborHex)));

  return scripts;
};
