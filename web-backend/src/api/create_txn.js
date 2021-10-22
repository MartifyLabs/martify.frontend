const { Address } = require('@emurgo/cardano-serialization-lib-nodejs')

const { cardano } = require("../cardano")

exports.create_txn = function(params) {

  return new Promise((resolve, reject) => {

    const address_hex = params["address"];
    const recipient = params["recipient"];
    const amount = params["amount"];
    
    const address = Address.from_bytes(Buffer.from(address_hex, "hex")).to_bech32()
    console.log("create_txn address:", address)

    var wallet_utxo = cardano.queryUtxo(address);

    const get_address_utxo = (paymentAddr) => {
      const utxos = cardano.queryUtxo(paymentAddr);
      const value = {};
      utxos.forEach((utxo) => {
        Object.keys(utxo.value).forEach((asset) => {
          if(utxo.value[asset]){
            if (!value[asset]) value[asset] = 0;
            value[asset] += utxo.value[asset];
          }
        });
      });
    
      return { utxo: utxos, value };
    };
    
    let txInfo = {
      txIn: wallet_utxo,
      txOut: [
        { 
          address: recipient, 
          value: { 
            lovelace: cardano.toLovelace(amount)
          } 
        },
        {
          address: address,
          value: get_address_utxo(address).value,
        },
      ],
      witnessCount: 1,
    };
        
    txInfo.txOut[1].value.lovelace -= cardano.toLovelace(amount);

    console.log("txInfo",JSON.stringify(txInfo, null, 2))

    const raw = cardano.transactionBuildRaw(txInfo);
    
    const fee = cardano.transactionCalculateMinFee({
      ...txInfo,
      txBody: raw,
    });
    
    txInfo.txOut[1].value.lovelace -= fee;
    
    const tx = cardano.transactionBuildRaw({ ...txInfo, fee:fee });
        
    const execSync = typeof window !== "undefined" || require("child_process").execSync;
    
    const out = JSON.parse(execSync(`cat ${tx}`));

    resolve({
      txhash: out["cborHex"],
      address: address
    });

  });

};