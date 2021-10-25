import Cardano from "../serialization-lib";
import { contractHex } from "./plutus";
import { fromHex } from "../../utils";

const CARDANO = Cardano.Instance();

export const contract = () => {
  const scripts = CARDANO.PlutusScripts.new();

  scripts.add(CARDANO.PlutusScript.new(fromHex(contractHex)));

  return scripts;
};

export const contractAddress = () => {
  CARDANO.Address.from_bech32("SMART_CONTRACT_ADDRESS");
};
