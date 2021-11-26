import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { get_listed_assets } from "../../store/collection/api";
import ListingDisplayListing from "../../components/ListingDisplayListing";

import "bulma-checkradio/dist/css/bulma-checkradio.min.css";
import "./style.css";

const Explore = ({get_listed_assets}) => {

  const [listings, setListings] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    get_listed_assets((res) => {
      
      if(res.data){
        let list_collections = {};
        setListings(res.data);
        
        let counter = 0;
        for(var i in res.data){
          let this_listing = res.data[i];
          if("id" in this_listing.collection){
            list_collections[this_listing.collection.meta.name] = {
              policy_ids: this_listing.collection.policy_ids,
              label: this_listing.collection.meta.name,
              rank: "is_martify_verified" in this_listing.collection ? 1 : 2,
              index: counter
            };
          }else{
            list_collections[this_listing.collection.policy_id] = {
              policy_ids: [this_listing.collection.policy_id],
              label: this_listing.collection.policy_id,
              rank: 3,
              index: counter
            };
          }
          counter+=1;
        }
        setCollections(list_collections);
      }
    });
  }, []);

  return (
    <div className="section explore">
      <div className="columns">
        <div className="column is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd">
          <Filter collections={collections} listings={listings} setListings={setListings} />
        </div>
        <div className="column">
          <ListingSection listings={listings} />
        </div>
      </div>
    </div>
  );
};

const Filter = ({collections, listings, setListings}) => {

  const [collectionsMultiSelect, setCollectionsMultiSelect] = useState(false);
  const [collectionsIndexSelected, setCollectionsIndexSelected] = useState([]);
  const [collectionsSelected, setCollectionsSelected] = useState([]);


  function click_item(collection){
    // console.log(collection);
    let tmp_collectionsIndexSelected = [...collectionsIndexSelected];
    
    if(tmp_collectionsIndexSelected.includes(collection.index)){
      var index = tmp_collectionsIndexSelected.indexOf(collection.index);
      if (index !== -1) {
        tmp_collectionsIndexSelected.splice(index, 1);
      }
    }else{
      tmp_collectionsIndexSelected.push(collection.index);
    }
    
    setCollectionsIndexSelected(tmp_collectionsIndexSelected);
    setCollectionsMultiSelect(tmp_collectionsIndexSelected.length>0);
  }

  return (
      <div className="card filter">

        <header className="card-header">
          <p className="card-header-title">
            Collections (WIP)
          </p>
        </header>
        <div className="card-content">
          <div className="content">
            {
              Object.keys(collections).map(function(key, index) {
                return collections[key];
              }).sort((a, b) => {
                return a.rank - b.rank;
              })
              .map((this_collection, i) => {
                return (
                  <div className="field" key={i}>
                    {
                      collectionsMultiSelect ? (
                        <>
                          <input className="is-checkradio" id={this_collection.label} type="checkbox" checked={collectionsIndexSelected.includes(this_collection.index)} onChange={() => click_item(this_collection)} /> 
                          <label className="filter_label" htmlFor={this_collection.label}>{this_collection.label}</label>
                        </>
                      )
                      : <label className="filter_label" onClick={() => click_item(this_collection)}>{this_collection.label}</label>
                    }
                    
                  </div>
                )
              })
            }
          </div>
        </div>
        
      </div>
  );
}

const ListingSection = ({listings}) => {
  return (
  <>
    {
      listings.length > 0 ? <ListingDisplayListing listings={listings} /> : <></>
    }
    {/* {
      listings.length == 0 ? <NoAssetFound state_collection={state_collection} policyIds={policyIds} /> : <></>
    } */}
  </>
  );
}

function mapStateToProps(state, props) {
  return {
    state_collection: state.collection,
    state_wallet: state.wallet,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    get_listed_assets: (callback) => dispatch(get_listed_assets(callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Explore);

