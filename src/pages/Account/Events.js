import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import Moment from 'react-moment';
import { Link } from "react-router-dom";
import { urls } from "../../config";
import { MARKET_TYPE } from "../../store/market/marketTypes";

const Events = ({state_wallet, state_collection}) => {

  const [events, setEvents] = useState([]);

  function load_events(){

    let events = [];
    for(var asset_id in state_wallet.assets){
      let policy_id = state_wallet.assets[asset_id].policy_id;
      let this_asset = state_collection.policies_assets[policy_id][asset_id];

      // if("listing" in this_asset){
      //   if(this_asset.listing.is_listed){
      //     var this_event = {
      //       type: "listed",
      //       time: parseInt(this_asset.listing.on),
      //       price: this_asset.listing.price,
      //       asset_id: asset_id,
      //       policy_id: policy_id,
      //     }
      //     events.push(this_event);
      //   }
      // }

      if("history" in this_asset){
        for(var i in this_asset.history){
          var this_event = {
            ...this_asset.history[i],
            asset_id: asset_id,
            policy_id: policy_id,
          };
          events.push(this_event);
        }
      }

      if("offers" in this_asset){
        for(var wallet_address in this_asset.offers){
          var this_event = {
            type: "offer",
            time: parseInt(this_asset.offers[wallet_address].t),
            price: this_asset.offers[wallet_address].p,
            asset_id: asset_id,
            policy_id: policy_id,
          }
          events.push(this_event);
        }
      }
      
    }

    setEvents(events);
  }

  useEffect(() => {
    load_events();
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
            return b.on - a.on;
          })
          .map((this_event, i) => {
            let this_asset = state_collection.policies_assets[this_event.policy_id][this_event.asset_id];
            return(
              <tr key={i}>
                <td>
                  <Moment format="MMM DD YYYY HH:mm">
                    {this_event.on}
                  </Moment>
                </td>
                <td style={{"textTransform": "capitalize"}}>{this_event.type}</td>
                <td>
                  <Link to={`/assets/${this_event.policy_id}/${this_event.asset_id}`}>
                    {this_asset.details.onchainMetadata.name}
                  </Link>
                </td>
                <td>
                  {
                    this_event.type==MARKET_TYPE.NEW_LISTING ? `${this_asset.details.onchainMetadata.name} has been listed for ₳${this_event.price}` : 
                    this_event.type=="offer" ? `Someone has offered ${this_asset.details.onchainMetadata.name} for ₳${this_event.price}` : 
                    this_event.type==MARKET_TYPE.DELIST ? `${this_asset.details.onchainMetadata.name} has been removed from the marketplace` : 
                    this_event.type==MARKET_TYPE.PRICE_UPDATE ? `${this_asset.details.onchainMetadata.name} listing price updated to ₳${this_event.price}` : 
                    this_event.type==MARKET_TYPE.PURCHASE ? `${this_asset.details.onchainMetadata.name} purchased from the marketplace for ₳${this_event.price}` : 
                    ""
                  }
                </td>
                <td>
                  <a href={urls.cardanoscan+"transaction/"+this_event.tx} target="_blank" rel="noreferrer">{this_event.tx}</a>
                </td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}

export default Events;
