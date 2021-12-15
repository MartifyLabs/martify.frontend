import React, { useEffect } from "react";
import SweetAlert from 'react-bootstrap-sweetalert';
import { useDispatch, useSelector } from "react-redux";
import RenderRoutes from "routes";

import { load_collection } from "store/collection/api";
import { clearError } from "store/error/api";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css";
import "App.css";

const App = () => {
  const dispatch = useDispatch();
  const state_collection = useSelector(state => state.collection)
  const state_error = useSelector(state => state.error)

  useEffect(() => {
    if (!state_collection.loaded && !state_collection.loading) {
      dispatch(load_collection)
    }
  }, [state_collection.loaded, state_collection.loading]);

  return (
    <>
      <RenderRoutes />
      <SweetAlert
        title=""
        show={state_error.show}
        error
        confirmBtnText="Oops!"
        onConfirm={() => dispatch(clearError)}
        confirmBtnCssClass="button is-danger"
      >
        {state_error.message}
      </SweetAlert>
    </>
  );
};

export default App;
