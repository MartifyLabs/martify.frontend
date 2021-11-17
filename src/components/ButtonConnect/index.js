import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { connectWallet, get_wallet_assets } from "../../store/wallet/api";
import { WALLET_STATE } from "../../store/wallet/walletTypes";
import { func } from "assert-plus";

const ButtonConnect = ({state_wallet, connectWallet, get_wallet_assets}) => {

  const [showNotification, setShowNotification] = useState(false);
  const [showNotificationMessage, setShowNotificationMessage] = useState(false);

  function connect_wallet(){
    connectWallet((res) => {
      if(!res.success){
        setShowNotificationMessage(res.msg);
      }
    });
  }

  useEffect(() => {

    if(state_wallet.loading){
      if(["no-nami", "no-accept", "connected", WALLET_STATE.CONNECTING, WALLET_STATE.GETTING_ASSETS].includes(state_wallet.loading))
        setShowNotification(state_wallet.loading);
    }else{
      setShowNotification(false);
    }

    if(state_wallet.connected && !state_wallet.loading && !state_wallet.loaded_assets){
      get_wallet_assets((res) => {
        
      });
    }

  }, [state_wallet]);


  function clear_notification(){
    setShowNotification(false);
    setShowNotificationMessage(false);
  }
  
  return (
    <>
      {
        !state_wallet.connected ? (
          <button className={"button is-rounded is-info" + (state_wallet.loading ? " is-loading" : "")} disabled={state_wallet.loading} onClick={() => connect_wallet()}>
            <span>Connect</span>
          </button>
        ) : (
          <Link className="button is-rounded is-info" to="/account">
            <span>Account</span>
          </Link>
        )
      }
      {
        showNotification || showNotificationMessage != false? (
          <div className="notification-window notification is-info">
            <button className="delete" onClick={() => clear_notification()}></button>
            {
              showNotification === "no-nami" ? (
                <p>
                  Nami Wallet not installed. <a href="https://namiwallet.io/" target="_blank" rel="noreferrer">Get it</a>.
                </p>
              ) : 
              showNotification === "no-accept" ? (
                <p>
                  You need to allow Nami access.
                </p>
              ) : showNotification === "connected" ? (
                <p>
                  Nami Wallet connected
                </p>
              ) : showNotification === WALLET_STATE.CONNECTING ? (
                <p>
                  Connecting to Nami wallet...
                </p>
              ) : showNotification === WALLET_STATE.GETTING_ASSETS ? (
                <p>
                  Getting assets in your wallet...
                </p>
              ) : showNotificationMessage != false ? (
                <p>
                  {showNotificationMessage}
                </p>
              ) : <></>
            }
          </div>
        ) : <></>
      }
    </>
  );
};

function mapStateToProps(state, props) {
  return {
    state_wallet: state.wallet,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    connectWallet: (callback) => dispatch(connectWallet(callback)),
    get_wallet_assets: (callback) => dispatch(get_wallet_assets(callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(ButtonConnect);
