import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";

// redux store
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import reduxThunk from "redux-thunk";
import reducers from "./store/reducers";

import App from './App';

const middleware = [
  reduxThunk
];
const store = createStore(
  reducers,
  composeWithDevTools(
    applyMiddleware(...middleware),
  )
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
