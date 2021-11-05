import React, { useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { create_txn, buyer_pay } from "../../store/wallet/api";
import {urls} from "../../config";

const ButtonBuy = ({wallet, create_txn, buyer_pay}) => {

  const [showNotification, setShowNotification] = useState(false);

  async function begin_buy_process() {

    // let amount = 2;

    // if(amount){
    //   create_txn(wallet.data.used_addr, amount, (res) => {
    //     if(res.success){
    //       setShowNotification({
    //         type: "payment-success",
    //         data: res.txn
    //       });
    //       setTimeout(function(){ setShowNotification(false); }, 30000);
    //     }
    //   });
    // }

    // buyer_pay(wallet.data.used_addr, (res) => {
    //   console.log(res)
    // });

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
                      <a href={urls.cardanoscan_url+showNotification.data} target="_blank" rel="noreferrer">{showNotification.data}</a>.
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
