import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import {get_wallet_assets} from "../../store/market/api";

const Wallet = ({state_wallet, get_wallet_assets}) => {

  function debug(){
    if(state_wallet.connected && !state_wallet.loading){
      console.log(state_wallet.data)
      get_wallet_assets(state_wallet.data.utxos, (res) => {
        console.log(res)
      });
    }
    

  }
  return (
    <div className="container">
      
      <button className={"button is-primary" + (state_wallet.loading ? " is-loading" : "")} disabled={state_wallet.loading || !state_wallet.connected} onClick={() => debug()}>
        <span>debug</span>
      </button>

    </div>
  );
};


function mapStateToProps(state, props) {
  return {
    state_wallet: state.wallet
  };
}

function mapDispatchToProps(dispatch) {
  return {
    get_wallet_assets: (utxos, callback) => dispatch(get_wallet_assets(utxos, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Wallet);
