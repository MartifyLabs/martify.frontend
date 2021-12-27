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

          <Link className="navbar-item" to="/explore">Explore</Link>
          
          {/* <Link className="navbar-item" to="/guide">User Guide</Link> */}
          <div class="navbar-item has-dropdown is-hoverable">
            <Link className="navbar-item" to="/guide">User Guide</Link>

            <div class="navbar-dropdown">
              <Link className="navbar-item" to="/guide-buy">Buying</Link>
              <Link className="navbar-item" to="/guide-sell">Selling</Link>
              {/* <hr class="navbar-divider"/> */}
            </div>
          </div>
          
          <Link className="navbar-item" to="/about">About Us</Link>
          
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

export default Navbar; 
