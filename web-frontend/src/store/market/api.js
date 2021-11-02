export const listToken = (policy_id, asset_id, price, callback) => async (dispatch) => {
  try {
    console.log("listToken", policy_id, asset_id, price);
    
    callback({success: true});
  } catch (error) {
    console.error(`Unexpected error in listToken. [Message: ${error.message}]`);
  }
};

export const delistToken = () => async (dispatch) => {
  try {
  } catch (error) {
    console.error(`Unexpected error in delistToken. [Message: ${error.message}]`);
  }
};

export const purchaseToken = () => async (dispatch) => {
  try {
  } catch (err) {}
};
