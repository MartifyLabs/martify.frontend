import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { load_collection, get_listings } from "../../store/collection/api";
import AssetCard from "../../components/AssetCard";
import CollectionAbout from "../../components/CollectionAbout";
import CollectionBanner from "../../components/CollectionBanner";

import "./style.css";

const Collection = ({state_collection, collection_id, get_listings}) => {
  
  const [policyId, setPolicyId] = useState(false);

  const default_meta = {
    is_verified: false,
    policy_id: false,
    meta: {

    },
    style: {
      font_color_title: "#fff",
      banner_path: "/images/collection/banner.jpg"
    },
    links: {}
  };
  const [thisCollection, setThisCollection] = useState(default_meta);

  useEffect(() => {
    if(collection_id in state_collection.collections || collection_id in state_collection.policies_collections){
      let policy_id = collection_id;

      if(collection_id in state_collection.collections){
        policy_id = state_collection.collections[collection_id];
        setPolicyId(policy_id);
      }else{
        setPolicyId(collection_id);
      }

      var tmp = {...state_collection.policies_collections[policy_id]};
      setThisCollection(tmp);
    }
    else{
      var tmp = {...default_meta};
      tmp.policy_id = collection_id;
      setPolicyId(collection_id);
      setThisCollection(tmp);
    }
  }, [state_collection, collection_id]);

  useEffect(() => {
    if(policyId){
      get_listings(policyId, (res) => {});
    }
  }, [policyId]);
  
  return (
    <div className="collection">

      <CollectionBanner thisCollection={thisCollection} />
      
      <section className="section">
        <div className="columns">
          {
            thisCollection.is_verified ? (
              <div className="column is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd">
                <div className="block">
                  { thisCollection ? <CollectionAbout thisCollection={thisCollection} /> : <></> }
                </div>
              </div>
            ) : <></>
          }
          <div className="column">
            <ListingSection state_collection={state_collection} policyId={policyId} />
          </div>
        </div>
      </section>

    </div>
  );
};

const ListingSection = ({state_collection, policyId}) => {

  const [listings, setListings] = useState([]);

  function load(){
    setListings([]);
    if(policyId in state_collection.policies_assets){
      let tmp = Object.values(state_collection.policies_assets[policyId]);
      setListings(tmp);
    }
  }

  useEffect(() => {
    load()
  }, [policyId, state_collection]);

  useEffect(() => {
    load()
  }, []);

return (
  <>
  {
    listings.length > 0 ? <DisplayListing listings={listings} /> : <></>
  }
  {
    listings.length == 0 ? <NoAssetFound state_collection={state_collection} policyId={policyId} /> : <></>
  }
  </>
  );
}

const DisplayListing = ({listings}) => {

  const [searchText, setSearchText] = useState("");
  const [sortby, setSortby] = useState("");
  const sort_options = [
    {"value": 1, "label": "Price: Low to High"},
    {"value": 2, "label": "Price: High to Low"},
  ]

  const searchingFor = searchText => {
    return x => {
      let return_this = false;
      if (searchText === "") {
        return_this = true;
      }
      else if (
        searchText !== "" &&
        (
          x.info.onchainMetadata.name.toLowerCase().includes(searchText.toLowerCase())
        )
      ) {
        return_this = true;
      }
      return return_this;
    };
  };
  
  let matchedtokens = listings.filter(searchingFor(searchText));

  const filtered_listing = matchedtokens
  .sort((a, b) => {
    if(sortby===1){
      return a.price > b.price ? 1 : -1
    }
    if(sortby===2){
      return a.price > b.price ? -1 : 1
    }
  })
  .map((this_nft, i) => {
    return(
      <AssetCard asset={this_nft} key={i} />
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
      <div className="control">
        <span className="select">
          <select value={sortby} onChange={(event) => setSortby(event.target.value)}>
            {
              sort_options.map((option, i) => {
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
  );
}

const NoAssetFound = ({state_collection, policyId}) => {
  return (
    <section className="hero is-medium">
      <div className="hero-body">
        <div className="container has-text-centered">
          {
            state_collection.loading ? (
              <>
                <h1>
                  <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
                    <i className="fas fa-truck-loading"></i>
                  </span>
                </h1>
                <p className="title">
                  Fetching assets
                </p>
                <p className="subtitle">
                  This may take awhile...
                </p>
              </>
            ) : <></>
          }
          {
            !state_collection.loading && policyId in state_collection.policies_assets ? (
              <>
                <h1>
                  <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
                    <i className="far fa-times-circle"></i>
                  </span>
                </h1>
                <p className="title">
                  No assets
                </p>
                <p className="subtitle">
                  This policy ID does not exist or does not contain any assets.
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
    collection_id: props.match.params.collection_id,
    state_collection: state.collection
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load_collection: (callback) => dispatch(load_collection(callback)),
    get_listings: (policy_id, callback) => dispatch(get_listings(policy_id, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Collection);
