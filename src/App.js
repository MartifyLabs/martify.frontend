import React, { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useHistory } from "react-router-dom";
import SweetAlert from "react-bootstrap-sweetalert";
import { useDispatch, useSelector } from "react-redux";
import RenderRoutes from "routes";

import { load_collection } from "store/collection/api";
import { clear_error } from "store/error/errorActions";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css";
import "./App.css";

const App = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const state_collection = useSelector((state) => state.collection);
  const state_error = useSelector((state) => state.error);

  useEffect(() => {
    if (!state_collection.loaded && !state_collection.loading) {
      dispatch(load_collection((res) => {}));
    }
  }, [state_collection.loaded, state_collection.loading]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorHandler}
      onReset={() => history.push("/")}
    >
      <RenderRoutes />
      <SweetAlert
        title=""
        show={state_error.show}
        error
        confirmBtnText="Oops!"
        onConfirm={() => dispatch(clear_error())}
        confirmBtnCssClass="button is-danger"
      >
        {state_error.message}
      </SweetAlert>
    </ErrorBoundary>
  );
};

const ErrorHandler = ({ error, componentStack, resetErrorBoundary }) => {
  return (
    <SweetAlert
        show
        error
        title="Oops!"
        confirmBtnText="Go To Homepage"
        onConfirm={resetErrorBoundary}
        confirmBtnCssClass="button is-danger"
      >
        An error occured while attempting to display this page.
    </SweetAlert>
  );
};

export default App;
