import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import {
  availableWallets,
  connectWallet,
  loadAssets,
} from "../../store/wallet/api";
import { WALLET_STATE } from "../../store/wallet/walletTypes";
import { FadeImg } from "components/Fades";

import "./style.scss";

const wallets = {
  ccvault: {
    title: "ccvault.io",
    image: "/images/wallets/ccvault.png",
  },
  gerowallet: {
    title: "GeroWallet",
    image: "/images/wallets/gero.png",
  },
  nami: {
    title: "Nami",
    image: "/images/wallets/nami.svg",
  },
};

const ButtonConnect = ({
  state_wallet,
  availableWallets,
  connectWallet,
  loadAssets,
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showNotificationMessage, setShowNotificationMessage] = useState(false);
  const [showWallets, setShowWallets] = useState(false);

  function onclick_connect_wallet() {
    availableWallets((res) => {
      if (res.wallets.length === 0) {
        setShowNotification("no-wallet");
      } else if (res.wallets.length === 1) {
        connect_wallet(res.wallets[0]);
      } else if (res.wallets.length > 1) {
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
        <div
          className="modal-background"
          onClick={() => setShowWallets(false)}
        ></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title has-text-centered">
              Connect a Wallet
            </p>
            <button
              className="delete"
              aria-label="close"
              onClick={() => setShowWallets(false)}
            ></button>
          </header>
          <section className="modal-card-body">
            <div className="columns">
              {showWallets &&
                showWallets.length > 0 &&
                showWallets.map((name) => (
                  <div
                    key={name}
                    className="card column wallet-button"
                    disabled={state_wallet.loading}
                    onClick={() => connect_wallet(name)}
                  >
                    <div className="card-image">
                      <figure className="image">
                        <FadeImg
                          alt={name}
                          src={wallets[name].image}
                        />
                      </figure>
                    </div>
                    <div className="card-content">
                      <div className="content">
                        <span className="wallet-title">
                          {wallets[name].title}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
          <footer className="modal-card-foot"></footer>
        </div>
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
    availableWallets: (callback) => dispatch(availableWallets(callback)),
    connectWallet: (is_silent, callback) =>
      dispatch(connectWallet(is_silent, callback)),
    loadAssets: (wallet, callback) => dispatch(loadAssets(wallet, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  ButtonConnect
);
