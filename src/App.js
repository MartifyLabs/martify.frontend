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
import HowGetStarted from "./pages/HowGetStarted";
import FAQ from "./pages/FAQ";
import Explore from "./pages/Explore";
import SweetAlert from 'react-bootstrap-sweetalert';

import "@fortawesome/fontawesome-free/css/all.min.css";
import "@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css";

import "./App.css";

import { load_collection } from "./store/collection/api";
import { clearError } from "./store/error/api";

const App = ({ state_collection, state_error, load_collection, error_clearError }) => {
  useEffect(() => {
    if (!state_collection.loaded && !state_collection.loading) {
      load_collection((res) => {
      });
    }
  }, [state_collection, load_collection, error_clearError]);

  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/collection/:collection_id" component={Collection} />
        <Route exact path="/assets/:policy_id/:asset_id" component={Asset} />
        <Route exact path="/explore" component={Explore} />
        <Route exact path="/account" component={Account} />
        <Route exact path="/about" component={About} />
        <Route exact path="/faq" component={FAQ} />
        <Route exact path="/how-get-started" component={HowGetStarted} />
      </Switch>
      <SweetAlert
        show={state_error.show}
        error
        title="OOPS!"
        onConfirm={error_clearError}
      >
        {state_error.message}
      </SweetAlert>
    </>
  );
};

function mapStateToProps(state, props) {
  return {
    state_collection: state.collection,
    state_error: state.error,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load_collection: (callback) => dispatch(load_collection(callback)),
    error_clearError: () => dispatch(clearError()),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(App);
