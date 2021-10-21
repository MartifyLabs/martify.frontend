import { combineReducers } from "redux";

import walletReducer from "./wallet/walletReducer";

export default combineReducers({
  wallet: walletReducer,
});
