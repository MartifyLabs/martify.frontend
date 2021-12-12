import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import Moment from 'react-moment';
import { Link } from "react-router-dom";
import { urls } from "../../config";
import { MARKET_TYPE } from "../../store/wallet/walletTypes";
import { fromLovelace } from "../../utils";
import { get_assets } from "../../store/collection/api";

const Events = ({state_wallet, state_collection, get_assets}) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    setEvents([]);
    var list_events = [];
    var assetIds = [];
    for(var i in state_wallet.data.events){
      let this_event = state_wallet.data.events[i];
      list_events.push(this_event);
      assetIds.push(this_event.datum.cs+this_event.datum.tn);
    }

    assetIds = Array.from( new Set(assetIds) );
    get_assets(assetIds, (res) => {
      setEvents(list_events);
    });
  }, []);

  return (
    <table className="table is-hoverable is-fullwidth is-striped">
      <thead>
        <tr>
          <th>Date Time</th>
          <th>Event type</th>
          <th>Asset</th>
          <th>Description</th>
          <th>Transaction ID</th>
        </tr>
      </thead>
      <tbody>
        {
          events.sort((a, b) => {
            return b.submittedOn - a.submittedOn;
          })
          .map((this_event, i) => {
            let this_asset = state_collection.policies_assets[this_event.datum.cs][this_event.datum.cs+this_event.datum.tn];
            return(
              <tr key={i}>
                <td>
                  <Moment format="MMM DD YYYY HH:mm">
                    {this_event.submittedOn}
                  </Moment>
                </td>
                <td style={{"textTransform": "capitalize"}}>{this_event.action.replace('_', ' ')}</td>
                <td>
                  <Link to={`/assets/${this_event.datum.cs}/${this_event.datum.cs+this_event.datum.tn}`}>
                    {this_asset.details.onchainMetadata.name}
                  </Link>
                </td>
                <td>
                  {
                    this_event.action===MARKET_TYPE.NEW_LISTING ? `${this_asset.details.onchainMetadata.name} has been listed for ₳${fromLovelace(this_event.datum.price)}` : 
                    this_event.action==="offer" ? `Someone has offered ${this_asset.details.onchainMetadata.name} for ₳${fromLovelace(this_event.datum.price)}` : 
                    this_event.action===MARKET_TYPE.DELIST ? `${this_asset.details.onchainMetadata.name} has been removed from the marketplace` : 
                    this_event.action===MARKET_TYPE.PRICE_UPDATE ? `${this_asset.details.onchainMetadata.name} listing price updated to ₳${fromLovelace(this_event.datum.price)}` : 
                    this_event.action===MARKET_TYPE.PURCHASE ? `${this_asset.details.onchainMetadata.name} purchased from the marketplace for ₳${fromLovelace(this_event.datum.price)}` : 
                    this_event.action===MARKET_TYPE.SOLD ? `${this_asset.details.onchainMetadata.name} sold for ₳${fromLovelace(this_event.datum.price)}` : 
                    ""
                  }
                </td>
                <td>
                  <a href={urls.cardanoscan+"transaction/"+this_event.txHash} target="_blank" rel="noreferrer">{this_event.txHash}</a>
                </td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}


function mapStateToProps(state, props) {
  return {
    state_collection: state.collection,
    state_wallet: state.wallet
  };
}

function mapDispatchToProps(dispatch) {
  return {
    get_assets: (assetIds, callback) => dispatch(get_assets(assetIds, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Events);
