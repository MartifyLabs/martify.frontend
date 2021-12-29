import * as types from "./errorTypes";

let errorObj = {
  show: false,
  message: '',
  detail: {},
};

export default function errorReducer(state = errorObj, { type, payload }) {
  switch (type) {
    case types.SET_ERROR:
      return {
        ...state,
        ...payload,
        show: true,
      };

    case types.CLEAR_ERROR:
      return errorObj;

    default:
      return state;
  }
}
