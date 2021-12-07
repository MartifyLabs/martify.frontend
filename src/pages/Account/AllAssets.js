import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import AssetCard from "../../components/AssetCard";
import { loadAssets } from "../../store/wallet/api";

const AllAssets = ({state_wallet, state_collection, loadAssets}) => {

  const [listings, setListings] = useState([]);
  const [searchText, setSearchText] = useState("");
  const default_list_projects = [{"value": "all", "label": "All Projects"}];
  const [listProjectsFilter, setListProjectsFilter] = useState([...default_list_projects]);
  const [filterProject, setFilterProject] = useState("all");
  const filters_assets = [
    {"value": "all", "label": "Show all assets"},
    {"value": "listed", "label": "Show listed"},
    {"value": "offered", "label": "Show has offers"},
  ];
  const [filterAsset, setFilterAsset] = useState("all");

  function add_asset(list_nfts, dict_projects, this_asset){
    if(this_asset){
      list_nfts.push(this_asset);
      let policy_id = this_asset.details.policyId;
      if(policy_id in state_collection.policies_collections){
        dict_projects[policy_id] = state_collection.policies_collections[policy_id].meta.name;
      }else{
        dict_projects[policy_id] = policy_id;
      }
    }
  }

  function load(){
    if(state_wallet.loaded_assets){
      let list_nfts = [];
      let list_projects = [...default_list_projects];
      let dict_projects = {};

      for(var i in state_wallet.data.assets){
        let this_asset = state_wallet.data.assets[i];
        add_asset(list_nfts, dict_projects, this_asset)
      }

      for(var i in state_wallet.data.market){
        let this_asset = state_wallet.data.market[i];
        add_asset(list_nfts, dict_projects, this_asset)
      }

      setListings(list_nfts);

      for(var policy_id in dict_projects){
        list_projects.push({"value": policy_id, "label": dict_projects[policy_id]})
      }
      setListProjectsFilter(list_projects);

    }
  }

  useEffect(() => {
    load();
  }, [state_wallet]);

  useEffect(() => {
    loadAssets(state_wallet, (res) => {
      load();
    });
  }, []);

  const searchingFor = searchText => {
    return x => {
      let return_this = false;
      if (searchText === "") {
        return_this = true;
      }
      else if (searchText !== "" && x.details.onchainMetadata){
        if(
          x.details.onchainMetadata.name.toLowerCase().includes(searchText.toLowerCase())
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
    let allow_project = false;

    if(filterProject==="all") allow_project = true;
    else allow_project = filterProject === asset.details.policyId;

    if(allow_project){
      if(filterAsset==="all"){
        return true;
      }else if(filterAsset==="listed" && asset.status.locked){
        return true;
      }else if(filterAsset==="offered"){
        if(asset.offers){
          if(Object.keys(asset.offers).length){
            return true;
          }else{
            return false;
          }
        }else{
          return false;
        }
      }else{
        return false;
      }
    }
    else{
      return false;
    }
  })
  .map((asset, i) => {
    return(
      <AssetCard asset={asset} show_offer={true} column_className="column is-one-full-mobile is-one-quarter-tablet is-2-desktop is-2-widescreen is-2-fullhd" key={i}/>
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

          <div className="control">
            <span className="select">
              <select value={filterAsset} onChange={(event) => setFilterAsset(event.target.value)}>
                {
                  filters_assets.map((option, i) => {
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
                  Do not have Nami Wallet? <a href="https://namiwallet.io/" target="_blank" rel="noreferrer">Download</a> now!
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
                  Looks like your wallet is empty, <a href="/explore">start browsing</a>!
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
    loadAssets: (wallet, callback) => dispatch(loadAssets(wallet, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(AllAssets);
