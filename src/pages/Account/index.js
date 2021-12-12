import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import AllAssets from "./AllAssets";
import Holdings from "./Holdings";
import Listings from "./Listings";
import Events from "./Events";

const Account = ({state_wallet, state_collection}) => {
  return (
    <>
      {
        !state_wallet.connected ? (
          <NotConnected/>
        ) : <></>
      }
      {
        state_wallet.connected ? (
          <Connected state_wallet={state_wallet} state_collection={state_collection} />
        ) : <></>
      }
    </>
  );
};

const Connected = ({state_wallet, state_collection}) => {

  const TABS = {
    ALL_ASSETS: {
      label: "All Assets",
      icon: "far fa-images",
    },
    HOLDINGS: {
      label: "Holdings",
      icon: "far fa-images",
    },
    LISTINGS: {
      label: "Listings",
      icon: "far fa-images",
    },
    EVENTS: {
      label: "Events",
      icon: "far fa-envelope",
    },
  }
  const [displayTab, setDisplayTab] = useState("ALL_ASSETS");

  return (
    <section className="section">
      <div className="tabs is-boxed">
        <ul>
          {
            Object.keys(TABS).map((key, i)=>{
              return (
                <li className={displayTab===key?"is-active":""} onClick={() => setDisplayTab(key)} key={i}>
                  <a>
                    <span className="icon is-small"><i className={TABS[key].icon} aria-hidden="true"></i></span>
                    <span>{TABS[key].label}</span>
                  </a>
                </li>
              )
            })
          }
        </ul>
      </div>

      { displayTab === "ALL_ASSETS" ? <AllAssets state_wallet={state_wallet} state_collection={state_collection} /> : <></> }
      { displayTab === "HOLDINGS" ? <Holdings state_wallet={state_wallet} state_collection={state_collection} /> : <></> }
      { displayTab === "LISTINGS" ? <Listings state_wallet={state_wallet} state_collection={state_collection} /> : <></> }
      { displayTab === "EVENTS" ? <Events state_wallet={state_wallet} state_collection={state_collection} /> : <></> }

    </section>
  )
}

const NotConnected = () => {
  return (
    <section className="hero is-large">
      <div className="hero-body">
        <div className="container has-text-centered">
          <h1>
            <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
              <i className="fas fa-plug"></i>
            </span>
          </h1>
          <p className="title">
            Connect your wallet
          </p>
          <p className="subtitle">
            Do not have Nami Wallet? <a href="https://namiwallet.io/" target="_blank" rel="noreferrer">Download</a> now!
          </p>
        </div>
      </div>
    </section>
  )
}

function mapStateToProps(state, props) {
  return {
    state_collection: state.collection,
    state_wallet: state.wallet
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Account);
