import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { connectWallet, get_wallet_assets } from "../../store/wallet/api";
import { WALLET_STATE } from "../../store/wallet/walletTypes";

const ButtonConnect = ({state_wallet, connectWallet, get_wallet_assets}) => {

  const [showNotification, setShowNotification] = useState(false);

  function connect_wallet(){
    connectWallet((res) => {});
  }

  useEffect(() => {

    if(state_wallet.loading){
      setShowNotification(state_wallet.loading);
    }else{
      setShowNotification(false);
    }

    if(state_wallet.connected && !state_wallet.loading && !state_wallet.loaded_assets){
      get_wallet_assets((res) => {});
    }

  }, [state_wallet]);

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
        showNotification ? (
          <div className="notification-window notification is-info">
            <button className="delete" onClick={() => setShowNotification(false)}></button>
            {
              showNotification === "no-nami" ? (
                <p>
                  Nami Wallet not installed. <a href="https://namiwallet.io/" target="_blank" rel="noreferrer">Get it</a>.
                </p>
              ) : <></>
            }
            {
              showNotification === "no-accept" ? (
                <p>
                  You need to allow Nami access.
                </p>
              ) : <></>
            }
            {
              showNotification === "connected" ? (
                <p>
                  Nami Wallet connected
                </p>
              ) : <></>
            }
            {
              showNotification === WALLET_STATE.CONNECTING ? (
                <p>
                  Connecting to Nami wallet...
                </p>
              ) : <></>
            }
            {
              showNotification === WALLET_STATE.GETTING_ASSETS ? (
                <p>
                  Getting assets in your wallet...
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
