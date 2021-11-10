import React, { useEffect } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Switch, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Asset from "./pages/Asset";
import Account from "./pages/Account";
import About from "./pages/About";
import Howitworks from "./pages/Howitworks";
import FAQ from "./pages/FAQ";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css";

import "./App.css";

import { load_collection, get_assets_in_policy } from "./store/collection/api";

const App = ({ state_collection, load_collection, get_assets_in_policy }) => {
  useEffect(() => {
    if (!state_collection.loaded && !state_collection.loading) {
      load_collection((res) => {

        // var count = 0
        // let policies = {};
        // for(var id in res.all_collections){
        //   policies[id] = res.all_collections[id].policy_id[0];
        //   count+=1;
        //   if(count>3) break
        // }

        // get_assets_in_policy(policies, (res) => {
          
        // });

      });
    }
  }, [load_collection, state_collection]);

  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/collection/:collection_id" component={Collection} />
        <Route exact path="/assets/:policy_id/:asset_id" component={Asset} />
        <Route exact path="/account" component={Account} />
        <Route exact path="/about" component={About} />
        <Route exact path="/faq" component={FAQ} />
        <Route exact path="/howitworks" component={Howitworks} />
      </Switch>
    </>
  );
};

function mapStateToProps(state, props) {
  return {
    state_collection: state.collection,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load_collection: (callback) => dispatch(load_collection(callback)),
    get_assets_in_policy: (policies, callback) => dispatch(get_assets_in_policy(policies, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(App);
