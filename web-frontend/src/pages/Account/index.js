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
  const default_list_projects = [{"value": "all", "label": "All Projects"}];
  const [listProjectsFilter, setListProjectsFilter] = useState([...default_list_projects]);
  const [filterProject, setFilterProject] = useState("all");

  function load(){
    if(state_wallet.loaded_assets){
      let list_nfts = [];
      let list_projects = [...default_list_projects];
      let dict_projects = {};

      for(var asset_id in state_wallet.assets){
        let this_asset_ids = state_wallet.assets[asset_id];
        let this_asset = state_collection.policies_assets[this_asset_ids.policy_id][this_asset_ids.asset_id];
        list_nfts.push(this_asset);

        if(this_asset_ids.policy_id in state_collection.policies_collections){
          dict_projects[this_asset_ids.policy_id] = state_collection.policies_collections[this_asset_ids.policy_id].meta.name;
        }else{
          dict_projects[this_asset_ids.policy_id] = this_asset_ids.policy_id;
        }
      }

      setListings(list_nfts);

      for(var policy_id in dict_projects){
        list_projects.push({"value": policy_id, "label": dict_projects[policy_id]})
      }
      setListProjectsFilter(list_projects);

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
  .filter((asset) => {
    if(filterProject=="all") return true;
    else return asset.info.policyId;
  })
  .map((asset, i) => {
    return(
      <AssetCard asset={asset} column_className="column is-one-full-mobile is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd" key={i}/>
    )
  });

return (
  <>
  {
    listings.length>0?(
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
          <div className="control">
            <span className="select">
              <select value={filterProject} onChange={(event) => setFilterProject(event.target.value)}>
                {
                  listProjectsFilter.map((option, i) => {
                    return(
                      <option value={option.value} key={i}>{option.label}</option>
                    )
                  })
                }
              </select>
            </span>
          </div>
        </div>

        <div className="columns is-multiline">
          {filtered_listing}
        </div>

      </div>
    ) : (
      <NoAssetFound state_wallet={state_wallet}/>
    )
  }
  </>
  );
}

const NoAssetFound = ({state_wallet}) => {
  return (
    <section className="hero is-large">
      <div className="hero-body">
        <div className="container has-text-centered">
          
          {
            !state_wallet.connected ? (
              <>
                <h1>
                  <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
                    <i className="fas fa-plug"></i>
                  </span>
                </h1>
                <p className="title">
                  Connect your wallet
                </p>
                <p className="subtitle">
                  Do not have Nami Wallet? <a href="https://namiwallet.io/" target="_blank">Download</a> now!
                </p>
              </>
            ) : <></>
          }

          {
            state_wallet.connected && state_wallet.loading ? (
              <>
                <h1>
                  <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
                    <i className="fas fa-truck-loading"></i>
                  </span>
                </h1>
                <p className="title">
                  Fetching your assets
                </p>
                <p className="subtitle">
                  This may take awhile...
                </p>
              </>
            ) : <></>
          }

          {
            state_wallet.connected && !state_wallet.loading && state_wallet.loaded_assets ? (
              <>
                <h1>
                  <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
                    <i className="fas fa-truck-loading"></i>
                  </span>
                </h1>
                <p className="title">
                  No assets
                </p>
                <p className="subtitle">
                  Looks like your wallet is empty, <a href="/">start browsing</a>!
                </p>
              </>
            ) : <></>
          }
        </div>
      </div>
    </section>
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
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Account);
