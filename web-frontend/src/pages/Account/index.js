import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import AssetCard from "../../components/AssetCard";

import {get_wallet_assets} from "../../store/wallet/api";

const Account = ({state_wallet, state_collection, get_wallet_assets}) => {

  // function debug(){
  //   if(state_wallet.connected && !state_wallet.loading){
  //     console.log(state_wallet.data)

  //     get_wallet_assets_mock(state_wallet.data.utxos, (res) => {
  //       console.log(res)
  //     });
  //   }
  // }

  return (
    <section className="section">

      <ListingSection state_wallet={state_wallet} state_collection={state_collection} get_wallet_assets={get_wallet_assets} />

      {/* <button className={"button is-primary" + (state_wallet.loading ? " is-loading" : "")} disabled={state_wallet.loading || !state_wallet.connected} onClick={() => debug()}>
        <span>debug</span>
      </button> */}

    </section>
  );
};


const ListingSection = ({state_wallet, state_collection, get_wallet_assets}) => {

  const [listings, setListings] = useState([]);
  const [searchText, setSearchText] = useState("");

  function load(){
    if(state_wallet.connected && !state_wallet.loading && !state_wallet.loaded_assets){
      get_wallet_assets((res) => {
        // console.log(res)
      });
    }

    if(state_wallet.loaded_assets){
      let list_nfts = [];
      for(var policy_id in state_wallet.assets){
        for(var i in state_wallet.assets[policy_id]){
          let asset_id = state_wallet.assets[policy_id][i];
          if(policy_id in state_collection.policies_tokens){
            if(asset_id in state_collection.policies_tokens[policy_id]){
              let this_asset = state_collection.policies_tokens[policy_id][asset_id];
              list_nfts.push(this_asset);
            }
          }
        }
      }
      setListings(list_nfts);
    }
  }

  useEffect(() => {
    load()
  }, [state_wallet]);

  useEffect(() => {
    load()
  }, []);

  const searchingFor = searchText => {
    return x => {
      let return_this = false;
      if (searchText === "") {
        return_this = true;
      }
      else if (
        searchText !== "" &&
        (
          x.meta.name.toLowerCase().includes(searchText.toLowerCase())
          // x.properties.some(x => x.toLowerCase().includes(searchText.toLowerCase()))
        )
      ) {
        return_this = true;
      }
      return return_this;
    };
  };
  
  let matchedtokens = listings.filter(searchingFor(searchText));

  const filtered_listing = matchedtokens
  .map((this_nft, i) => {
    return(
      <div className="column is-one-full-mobile is-half-tablet one-quarter-desktop is-one-quarter-widescreen is-one-quarter-fullhd" key={i}>
        <AssetCard token={this_nft} />
      </div>
    )
  });

return (
  <div className="block">
    <div className="field is-grouped">
      <div className="control has-icons-left is-expanded">
        <input
          className="input"
          type="text"
          placeholder={"Search"}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <span className="icon is-small is-left">
          <i className="fa fa-search"></i>
        </span>
      </div>
    </div>

    <div className="columns is-multiline">
      {filtered_listing}
    </div>

  </div>
  );
}


function mapStateToProps(state, props) {
  return {
    state_collection: state.collection,
    state_wallet: state.wallet
  };
}

function mapDispatchToProps(dispatch) {
  return {
    get_wallet_assets: (callback) => dispatch(get_wallet_assets(callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Account);
