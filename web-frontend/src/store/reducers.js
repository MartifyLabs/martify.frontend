import { combineReducers } from "redux";

import walletReducer from "./wallet/walletReducer";
import collectionReducer from "./collection/collectionReducer";

export default combineReducers({
  wallet: walletReducer,
  collection: collectionReducer,
});
