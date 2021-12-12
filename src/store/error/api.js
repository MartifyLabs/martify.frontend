import {
  set_error,
  clear_error,
} from "./errorActions";

export const setError = (message, detail) => (dispatch) => {
  dispatch(set_error({ message, detail }));
};

export const clearError = () => (dispatch) => {
  dispatch(clear_error());
};