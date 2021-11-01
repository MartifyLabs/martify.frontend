import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import AssetCard from "../../components/AssetCard";

const Account = ({state_wallet, state_collection}) => {

  return (
    <section className="section">
      <ListingSection state_wallet={state_wallet} state_collection={state_collection} />
    </section>
  );
};

const ListingSection = ({state_wallet, state_collection}) => {

  const [listings, setListings] = useState([]);
  const [searchText, setSearchText] = useState("");

  function load(){

    if(state_wallet.loaded_assets){
      let list_nfts = [];

      for(var asset_id in state_wallet.assets){
        let this_asset_ids = state_wallet.assets[asset_id];
        let this_asset = state_collection.policies_assets[this_asset_ids.policy_id][this_asset_ids.asset_id];
        list_nfts.push(this_asset);
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
      else if (searchText !== "" && x.info.onchainMetadata){
        if(
          x.info.onchainMetadata.name.toLowerCase().includes(searchText.toLowerCase())
        ){
          return_this = true;
        }
      }
      return return_this;
    };
  };
  
  let matchedtokens = listings.filter(searchingFor(searchText));

  const filtered_listing = matchedtokens
  .map((asset, i) => {
    return(
      <>
      {
        asset.info.onchainMetadata ? (
          <div className="column is-one-full-mobile is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd" key={i}>
            <AssetCard asset={asset} />
          </div>
        ) : <></>
      }
      </>
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
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Account);
