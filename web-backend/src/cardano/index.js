const fs = require('fs');
const CardanocliJs = require("./cardanocli");

// const config_json = fs.readFileSync('./config/config_mainnet.json');
const config_json = fs.readFileSync('./src/cardano/config/config_testnet.json');

const config = JSON.parse(config_json);
const dir = config.path_working_dir;

const cardanocliJs = new CardanocliJs({
  network: config.network,
  socketPath: config.path_db_node_socket,
  dir: dir,
  shelleyGenesisPath: config.shelleyGenesisPath,
});

export_modules = {
  cardano: cardanocliJs,
  config: config,
}

if(config.is_mainnet){
  // export_modules["wallet"] = cardanocliJs.wallet("VendereMainnet");
}else{
  export_modules["wallet"] = cardanocliJs.wallet("VendereTestnet");
}

module.exports = export_modules;
