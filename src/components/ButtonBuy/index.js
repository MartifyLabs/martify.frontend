import React, { useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import {urls} from "../../config";

const ButtonBuy = ({wallet, purchase_this_token}) => {

  const [showNotification, setShowNotification] = useState(false);

  async function begin_buy_process() {
    purchase_this_token();
  }

  return (
    <>
      <button className={"button is-rounded is-info" + (wallet.loading ? " is-loading" : "")} disabled={wallet.loading || !wallet.connected} onClick={() => begin_buy_process()}>
        <span>Buy Now</span>
      </button>
      {
        showNotification ? (
          <div className="notification-window notification ">
            <button className="delete" onClick={() => setShowNotification(false)}></button>
            {
              showNotification ? (
                <>
                {
                  showNotification.type === "payment-success" ? (
                    <p>
                      Payment successful.<br/>
                      <a href={urls.cardanoscan+showNotification.data} target="_blank" rel="noreferrer">{showNotification.data}</a>.
                    </p>
                  ) : <></>
                }
                </> 
              ) : <></>
            }
          </div>
        ) : <></>
      }
    </>
  );
};

function mapStateToProps(state, props) {
  return {
    wallet: state.wallet,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // create_txn: (send_addr, amount, callback) => dispatch(create_txn(send_addr, amount, callback)),
    // buyer_pay: (send_addr, callback) => dispatch(buyer_pay(send_addr, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(ButtonBuy);
