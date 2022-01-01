import React from "react";
import { Link } from "react-router-dom";

import "./style.scss";

import ButtonConnect from "../ButtonConnect";
import Search from "./Search";

const Navbar = () => {
  return (
    <nav className="main-navbar navbar is-fixed-top is-transparent">
      <div className="the-blur"></div>
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <span className="logo-text">Martify</span>
        </Link>
      </div>

      <div className="navbar-menu">
        <div className="navbar-start">
          <Link className="navbar-item" to="/explore">
            Explore
          </Link>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">How to</a>
            <div className="navbar-dropdown">
              <Link className="navbar-item" to="/guide-buy">
                <i className="fas fa-shopping-cart"></i> Buy a Cardano NFT?
              </Link>
              <Link className="navbar-item" to="/guide-sell">
                <i className="fas fa-store"></i>Sell a Cardano NFT?
              </Link>
            </div>
          </div>

          <Link className="navbar-item" to="/about">
            About Us
          </Link>
          
        </div>

        <div className="navbar-end">
          <div className="navbar-item is-expanded">
            <Search />
          </div>

          <div className="navbar-item">
            <div className="field is-grouped">
              <div className="control">
                <ButtonConnect />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
