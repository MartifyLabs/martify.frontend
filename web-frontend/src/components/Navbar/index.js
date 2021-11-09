import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
// import { Link } from "react-router-dom";

// import "./style.css";

import ButtonConnect from "../ButtonConnect";
import Search from "./Search";

const Navbar = ({state_wallet}) => {
  return (
    <nav className="navbar is-fixed-top is-transparent has-shadow">
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <img src="https://bulma.io/images/bulma-logo.png" alt="Market place" width="112" height="28"/>
        </a>
        {/* <div className="navbar-burger" data-target="navbarExampleTransparentExample">
          <span></span>
          <span></span>
          <span></span>
        </div> */}
      </div>

      <div className="navbar-menu">

        {/* <div className="navbar-start">
          <a className="navbar-item" href="https://bulma.io/">
            Home
          </a>
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link" href="https://bulma.io/documentation/overview/start/">
              Docs
            </a>
            <div className="navbar-dropdown is-boxed">
              <a className="navbar-item" href="https://bulma.io/documentation/overview/start/">
                Overview
              </a>
              <a className="navbar-item" href="https://bulma.io/documentation/overview/modifiers/">
                Modifiers
              </a>
              <a className="navbar-item" href="https://bulma.io/documentation/columns/basics/">
                Columns
              </a>
              <a className="navbar-item" href="https://bulma.io/documentation/layout/container/">
                Layout
              </a>
              <a className="navbar-item" href="https://bulma.io/documentation/form/general/">
                Form
              </a>
              <hr className="navbar-divider"/>
              <a className="navbar-item" href="https://bulma.io/documentation/elements/box/">
                Elements
              </a>
              <a className="navbar-item is-active" href="https://bulma.io/documentation/components/breadcrumb/">
                Components
              </a>
            </div>
          </div>
        </div> */}

        <div className="navbar-end">

          <div className="navbar-item is-expanded">
            
              {/* <input className="input" type="search" placeholder="Search..."/> */}
              <Search />
              
            
          </div>
          
          <div className="navbar-item">
            <div className="field is-grouped">
              <div className="control">
                <ButtonConnect/>
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

function mapStateToProps(state, props) {
  return {
    state_wallet: state.wallet
  };
}

function mapDispatchToProps(dispatch) {
  return {
    
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Navbar);
