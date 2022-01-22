import Cardano from "../serialization-lib";
import { fromHex, toHex } from "../../utils/converter";

export const serializeList = ({ owner, cstns }) => { //cstns is a list of tuples (policyId, tokenName)
  const fields = Cardano.Instance.PlutusList.new();

  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(owner)));
  
  const list = Cardano.Instance.PlutusList.new();

  for (let i = 0; i < cstns.length; i++) {
    const fields_inner = Cardano.Instance.PlutusList.new();
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(cstns[i][0])));
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(cstns[i][1])));
    const tuple = Cardano.Instance.PlutusData.new_constr_plutus_data(
      Cardano.Instance.ConstrPlutusData.new(
        Cardano.Instance.Int.new_i32(0),
        fields_inner
      )
    )
    list.add(tuple);
  };

  fields.add(list)
  const datum = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(0),
      fields
    )
  );

  return datum;
};

export const deserializeList = (datum) => {
  const details = datum.as_constr_plutus_data().data();
  const list = details.get(1);
  const cstns = [];
  for (let i = 0; i < list.length; i++) {
    const tuple = list[i].as_constr_plutus_data().data();
    cstns.push([toHex(tuple.get(0).as_bytes()), toHex(tuple.get(1).as_bytes())]);
  };

  return {
    owner: toHex(details.get(0).as_bytes()),
    cstns: cstns,
  };
};


export const serializeOffer = ({ cstns, offTokens, offerer }) => {
  const fields = Cardano.Instance.PlutusList.new();

  const list1 = Cardano.Instance.PlutusList.new();

  for (let i = 0; i < cstns.length; i++) {
    const fields_inner = Cardano.Instance.PlutusList.new();
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(cstns[i][0])));
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(cstns[i][1])));
    const tuple = Cardano.Instance.PlutusData.new_constr_plutus_data(
      Cardano.Instance.ConstrPlutusData.new(
        Cardano.Instance.Int.new_i32(0),
        fields_inner
      )
    )
    list1.add(tuple);
  };

  fields.add(list1)

  const list = Cardano.Instance.PlutusList.new();

  for (let i = 0; i < offTokens.length; i++) {
    const fields_inner = Cardano.Instance.PlutusList.new();
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(offTokens[i][0])));
    fields_inner.add(Cardano.Instance.PlutusData.new_bytes(fromHex(offTokens[i][1])));
    const tuple = Cardano.Instance.PlutusData.new_constr_plutus_data(
      Cardano.Instance.ConstrPlutusData.new(
        Cardano.Instance.Int.new_i32(0),
        fields_inner
      )
    )
    list.add(tuple);
  };

  fields.add(list)
  fields.add(Cardano.Instance.PlutusData.new_bytes(fromHex(offerer)));

  const datum = Cardano.Instance.PlutusData.new_constr_plutus_data(
    Cardano.Instance.ConstrPlutusData.new(
      Cardano.Instance.Int.new_i32(0),
      fields
    )
  );

  return datum;
};

export const deserializeOffer = (datum) => {
  const details = datum.as_constr_plutus_data().data();
  const list = details.get(0);
  const cstns = [];
  for (let i = 0; i < list.length; i++) {
    const tuple = list[i].as_constr_plutus_data().data();
    cstns.push([toHex(tuple.get(0).as_bytes()), toHex(tuple.get(1).as_bytes())]);
  };

  const list1 = details.get(1);
  const offTokens = [];
  for (let i = 0; i < list1.length; i++) {
    const tuple = list1[i].as_constr_plutus_data().data();
    offTokens.push([toHex(tuple.get(0).as_bytes()), toHex(tuple.get(1).as_bytes())]);
  };

  return {
    cstns: cstns,
    offTokens: offTokens,
    offerer: toHex(details.get(2).as_bytes()),
  };
};