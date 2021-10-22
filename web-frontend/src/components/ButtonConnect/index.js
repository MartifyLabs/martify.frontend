import React, { useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

// import "./style.css";

import { connectWallet } from "../../store/wallet/api";

const ButtonConnect = ({wallet, connectWallet}) => {

  const [showNotification, setShowNotification] = useState(false);

  function connect_wallet(){
    connectWallet((res) => {
      console.log(res)
      if (res.success){

        setShowNotification("connected");
        setTimeout(function(){ setShowNotification(false); }, 3000);

      }else{
        if(res.error){
          if(res.error.code === -3){
            setShowNotification("no-accept");
          }
          else{
            setShowNotification("no-nami");
          }
        }
      }
    });
  }
  

  return (
    <>
      {
        !wallet.connected ? (
          <button className={"button is-primary" + (wallet.loading ? " is-loading" : "")} disabled={wallet.loading} onClick={() => connect_wallet()}>
            <span>Connect</span>
          </button>
        ) : <></>
      }
      {
        showNotification ? (
          <div className="notification-window notification ">
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
          </div>
        ) : <></>
      }
    </>
  );
};

function mapStateToProps(state, props) {
  return {
    wallet: state.wallet,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    connectWallet: (id, callback) => dispatch(connectWallet(id, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(ButtonConnect);
