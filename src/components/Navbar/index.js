import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import "./style.css";

import ButtonConnect from "../ButtonConnect";
import Search from "./Search";

const Navbar = ({state_wallet}) => {
  return (
    <nav className="main-navbar navbar is-fixed-top is-transparent">
      <div className="the-blur"></div>
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <img src="/images/martify-logo-black-yellow-small.png" alt="Market place" width="112" height="28"/>
        </a>
        {/* <div className="navbar-burger" data-target="navbarExampleTransparentExample">
          <span></span>
          <span></span>
          <span></span>
        </div> */}
      </div>

      <div className="navbar-menu">

        <div className="navbar-start">

          {/* <Link className="navbar-item" to="about">About</Link> */}
          {/* <Link className="navbar-item" to="faq">FAQ</Link> */}
          
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
              How To...
            </a>
            <div className="navbar-dropdown is-boxed">
              <Link className="navbar-item" to="how-get-started">Get Started</Link>
              <Link className="navbar-item" to="how-get-started">Get Started</Link>
              <Link className="navbar-item" to="how-get-started">Get Started</Link>
              <hr className="navbar-divider"/>
              <Link className="navbar-item" to="how-get-started">Get Started</Link>
              <Link className="navbar-item" to="how-get-started">Get Started</Link>
            </div>
          </div>
        </div>

        <div className="navbar-end">

          <div className="navbar-item is-expanded">
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
