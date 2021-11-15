import Cardano from "../serialization-lib";
import { cborHex } from "./plutus";
import { fromHex } from "../../utils";

export const contractAddress = () => {
  return Cardano.Instance.Address.from_bech32(
    "addr_test1wq2m8ul5twkj8c0mc2nyxgr8ylk2u07rj882hs90a5yrhzgwgatvu"
  );
};

export const contractScripts = () => {
  const scripts = Cardano.Instance.PlutusScripts.new();

  scripts.add(Cardano.Instance.PlutusScript.new(fromHex(cborHex)));

  return scripts;
};
