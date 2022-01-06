import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { connectWallet, loadAssets, checkWalletAvailable } from "../../store/wallet/api";
import { WALLET_STATE } from "../../store/wallet/walletTypes";

const ButtonConnect = ({ state_wallet, connectWallet, loadAssets, checkWalletAvailable }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showNotificationMessage, setShowNotificationMessage] = useState(false);
  const [showWallets, setShowWallets] = useState(false);

  function onclick_connect_wallet() {
    checkWalletAvailable((res) => {
      if(res.wallets.length==0){
        setShowNotification("no-wallet");
      }else if(res.wallets.length==1){
        connect_wallet(res.wallets[0]);
      }else if(res.wallets.length>1){
        setShowWallets(res.wallets);
      }

    });
  }

  function connect_wallet(wallet_name) {
    setShowWallets(false);
    connectWallet(wallet_name, (res) => {
      if (!res.success) {
        setShowNotificationMessage(res.msg);
      }
    });
  }

  useEffect(() => {
    if (state_wallet.loading) {
      if (
        [
          "no-wallet",
          "no-accept",
          "connected",
          WALLET_STATE.CONNECTING,
          WALLET_STATE.GETTING_ASSETS,
        ].includes(state_wallet.loading)
      )
        setShowNotification(state_wallet.loading);
    } else {
      setShowNotification(false);
    }

    if (
      state_wallet.connected &&
      !state_wallet.loading &&
      !state_wallet.loaded_assets
    ) {
      loadAssets(state_wallet, (res) => {});
    }
  }, [loadAssets, state_wallet]);

  function clear_notification() {
    setShowNotification(false);
    setShowNotificationMessage(false);
  }

  return (
    <>
      {!state_wallet.connected ? (
        <button
          className={
            "button is-rounded is-info" +
            (state_wallet.loading ? " is-loading" : "")
          }
          disabled={state_wallet.loading}
          onClick={() => onclick_connect_wallet()}
        >
          <span>Connect</span>
        </button>
      ) : (
        <Link className="button is-rounded is-info" to="/account">
          <span>Account</span>
        </Link>
      )}
      {showNotification || showNotificationMessage !== false ? (
        <div className="notification-window notification is-info">
          <button
            className="delete"
            onClick={() => clear_notification()}
          ></button>
          {showNotification === "no-wallet" ? (
            <p>
              No wallet installed.{" "}
              <a href="https://namiwallet.io/" target="_blank" rel="noreferrer">
                Get it now
              </a>
              .
            </p>
          ) : showNotification === "no-accept" ? (
            <p>You need to allow wallet access.</p>
          ) : showNotification === "connected" ? (
            <p>Wallet connected</p>
          ) : showNotification === WALLET_STATE.CONNECTING ? (
            <p>Connecting wallet...</p>
          ) : showNotification === WALLET_STATE.GETTING_ASSETS ? (
            <p>Getting assets in your wallet...</p>
          ) : showNotificationMessage !== false ? (
            <p>{showNotificationMessage}</p>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}

      <div className={"modal " + (showWallets ? "is-active" : "")}>
        <div className="modal-background" onClick={() => setShowWallets(false)}></div>
        <div className="modal-content has-text-centered">
          <section className="modal-card-body">
            <h1 className="is-size-3">Select Wallet</h1>
            <div className="columns ">
              <div className="column">
                <center>
                  <button className="button is-large"
                      disabled={state_wallet.loading}
                      onClick={() => connect_wallet('nami')}
                    >
                    <figure className="image is-32x32">
                      <img src="/images/wallet-nami.svg"/>
                    </figure>
                    Nami
                  </button>
                </center>
              </div>
              <div className="column">
                <center>
                  <button className="button is-large"
                    disabled={state_wallet.loading}
                    onClick={() => connect_wallet('ccvault')}
                  >
                    <figure className="image is-32x32">
                      <img src="/images/wallet-ccvault.png"/>
                    </figure>
                    CCVault
                  </button>
                </center>
              </div>
            </div>
          </section>
        </div>
        <button
          className="modal-close is-large"
          aria-label="close"
          onClick={() => setShowWallets(false)}
        ></button>
      </div>
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
    connectWallet: (is_silent, callback) =>
      dispatch(connectWallet(is_silent, callback)),
    loadAssets: (wallet, callback) => dispatch(loadAssets(wallet, callback)),
    checkWalletAvailable: (callback) => dispatch(checkWalletAvailable(callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  ButtonConnect
);
