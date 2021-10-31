import React, { useEffect } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Switch, Route } from "react-router-dom";
import Cardano from "./cardano/serialization-lib";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Asset from "./pages/Asset";
import Account from "./pages/Account";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

import { load_collection } from "./store/collection/api";

const App = ({ state_collection, load_collection }) => {

  useEffect(() => {
    const loadCardanoSerializationLib = async () => {
      await Cardano.load();
    };
    loadCardanoSerializationLib();
  }, []);

  useEffect(() => {
    if (!state_collection.loaded && !state_collection.loading) {
      load_collection((res) => {});
    }
  }, [state_collection]);

  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/collection/:collection_id" component={Collection} />
        <Route exact path="/assets/:policy_id/:asset_id" component={Asset} />
        <Route exact path="/account" component={Account} />
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
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(App);
