import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import Moment from 'react-moment';
import { Link } from "react-router-dom";

const Events = ({state_wallet, state_collection}) => {

  const [events, setEvents] = useState([]);

  function load_events(){

    let events = [];
    for(var asset_id in state_wallet.assets){
      let policy_id = state_wallet.assets[asset_id].policy_id;
      let this_asset = state_collection.policies_assets[policy_id][asset_id];

      if("listing" in this_asset){
        if(this_asset.listing.is_listed){
          var this_event = {
            type: "listed",
            time: parseInt(this_asset.listing.listed_on),
            price: this_asset.listing.price,
            asset_id: asset_id,
            policy_id: policy_id,
          }
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
    <div className="columns">
      <div className="column">

        <table className="table is-hoverable is-fullwidth is-striped">
          <thead>
            <tr>
              <th>Date Time</th>
              <th>Event type</th>
              <th>Asset</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {
              events.sort((a, b) => {
                return b.time - a.time;
              })
              .map((this_event, i) => {
                let this_asset = state_collection.policies_assets[this_event.policy_id][this_event.asset_id];
                return(
                  <tr>
                    <td>
                      <Moment format="MMM DD YYYY">
                        {this_event.time}
                      </Moment>
                    </td>
                    <td style={{"textTransform": "capitalize"}}>{this_event.type}</td>
                    <td>
                      <Link to={`/assets/${this_event.policy_id}/${this_event.asset_id}`}>
                        {this_asset.info.onchainMetadata.name}
                      </Link>
                    </td>
                    <td>
                      {
                        this_event.type=="listed" ? `You have successfully listed ${this_asset.info.onchainMetadata.name} for ₳${this_event.price}` : ""
                      }
                      {
                        this_event.type=="offer" ? `Someone has offered ${this_asset.info.onchainMetadata.name} for ₳${this_event.price}` : ""
                      }
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        
      </div>
      <div className="column">
        
      </div>
    </div>
  )
}

export default Events;
