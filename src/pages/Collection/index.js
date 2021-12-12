import React, { useEffect, useState, useMemo } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { load_collection, get_listings, opencnft_get_policy } from "../../store/collection/api";
import AssetCard from "../../components/AssetCard";
import CollectionAbout from "../../components/CollectionAbout";
import CollectionBanner from "../../components/CollectionBanner";
import { numFormatter } from "../../utils";

import "./style.css";

const Collection = ({state_collection, collection_id, get_listings, opencnft_get_policy}) => {
  
  const default_meta = {
    id: "",
    meta: {

    },
    style: {
      font_color_title: false,
      banner_path: false
    },
    links: {}
  };

  const [policyIds, setPolicyIds] = useState(false);
  const [thisCollection, setThisCollection] = useState(default_meta);
  
  useEffect(() => {
    if(state_collection.loaded){
      
      let policy_ids = false;
      var this_collection = false;

      if(collection_id in state_collection.collections){
        this_collection = {...default_meta, ...state_collection.collections[collection_id]};
        policy_ids = this_collection.policy_ids;
      }
      else if(collection_id in state_collection.policies_collections){
        this_collection = {...default_meta, ...state_collection.policies_collections[collection_id]};
        policy_ids = [collection_id];
      }
      else{
        this_collection = {...default_meta, id:collection_id, policy_id: collection_id};
        policy_ids = [collection_id];
      }
      
      if(this_collection.id !== thisCollection.id){
        setPolicyIds(policy_ids);
        setThisCollection({...this_collection});

        for(var i in policy_ids){
          var policy_id = policy_ids[i];
          opencnft_get_policy(policy_id, (res) => {
            if(res.data.statusCode===404){}else{
              if(!("opencnft" in this_collection)){
                this_collection.opencnft = [];
              }
              this_collection.opencnft.push(res.data);
              setThisCollection({...this_collection});
            }
          });
        }
      }
    }
  }, [state_collection, collection_id]);
  
  useEffect(() => {
    if(policyIds){
      for(var i in policyIds){
        get_listings(policyIds[i], (res) => {});
      }
    }
  }, [policyIds]);
  
  return (
    <div className="collection">

      <CollectionBanner thisCollection={thisCollection} size={thisCollection.is_martify_verified?"is-medium":"is-small"} />
      
      <section className="section">
        <div className="columns">
          
          { thisCollection.is_martify_verified || thisCollection.is_cnft_verified ? 
            <div className="column is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd">
              <div className="block">
                <CollectionAbout thisCollection={thisCollection} />
              </div>
            </div>
           : <></> }
      
          <div className="column">
            <ListingSection state_collection={state_collection} policyIds={policyIds} />
          </div>

        </div>
      </section>

    </div>
  );
};

const ListingSection = ({state_collection, policyIds}) => {

  const [listings, setListings] = useState([]);

  function load(){
    setListings([]);
    let tmp_list = [];
    for(var i in policyIds){
      var policy_id = policyIds[i];
      if(policy_id in state_collection.policies_assets){
        let tmp = Object.values(state_collection.policies_assets[policy_id]);
        tmp_list.push(...tmp);
      }
    }
    setListings(tmp_list);
  }

  useEffect(() => {
    load();
  }, [policyIds, state_collection]);

  useEffect(() => {
    load();
  }, []);

return (
  <>
    {
      listings.length > 0 ? <DisplayListing listings={listings} /> : <></>
    }
    {
      listings.length === 0 ? <NoAssetFound state_collection={state_collection} policyIds={policyIds} /> : <></>
    }
  </>
  );
}

const DisplayListing = ({listings}) => {

  //pagination
  const pageSize = 16;
  const [currentPage, setCurrentPage] = useState(1);

  // search and filter
  const [searchText, setSearchText] = useState("");
  const [sortby, setSortby] = useState('lowtohigh');
  const sort_options = [
    {"value": 'lowtohigh', "label": "Price: Low to High"},
    {"value": 'hightolow', "label": "Price: High to Low"},
  ];

  const searchingFor = searchText => {
    return x => {
      let return_this = false;

      if(x.details.onchainMetadata==null){
        return false
      }

      if (searchText === "") {
        return_this = true;
      }
      else if (
        searchText !== "" &&
        (
          x.details.onchainMetadata.name.toLowerCase().includes(searchText.toLowerCase())
        )
      ) {
        return_this = true;
      }
      return return_this;
    };
  };
  
  let matchedtokens = listings.filter(searchingFor(searchText));

  const filtered_listing = matchedtokens
  .filter((this_nft, i) => {
    let current_index_min = ((currentPage-1)*pageSize)
    let current_index_max = (currentPage*pageSize)
    if(i>=current_index_min && i<current_index_max){
      return true;
    }
    return false;
  })
  .sort((a, b) => {
    let a_price = a.listing.price!==undefined ? a.listing.price : 999999;
    let b_price = b.listing.price!==undefined ? b.listing.price : 999999;

    if(sortby==='lowtohigh'){
      return a_price - b_price;
    }
    if(sortby==='hightolow'){
      return b_price - a_price;
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
    
    {
      (matchedtokens.length/pageSize) > 1 ? (
        <nav className="pagination is-rounded" role="navigation" aria-label="pagination">
          <button className="pagination-previous" onClick={() => setCurrentPage(currentPage-1)} disabled={currentPage===1}>Previous</button>
          <button className="pagination-next" onClick={() => setCurrentPage(currentPage+1)} disabled={currentPage===(matchedtokens.length/pageSize)}>Next page</button>
          <ul className="pagination-list">
            {
              currentPage!==1?(
                <li><a className="pagination-link" aria-label="Goto page 1" onClick={() => setCurrentPage(1)}>1</a></li>
              ) : <></>
            }
            {
              currentPage > 3 ? (
                <li><span className="pagination-ellipsis">&hellip;</span></li>
              ) : <></>
            }
            { 
              currentPage > 2 ? 
                <li><a className="pagination-link" aria-label="Goto page 45" onClick={() => setCurrentPage(currentPage-1)}>{currentPage-1}</a></li>
              : <></>
            }
            <li><a className="pagination-link is-current" aria-label="Page 46" aria-current="page">{currentPage}</a></li>
            {
              currentPage < (matchedtokens.length/pageSize) ? (
                <li><a className="pagination-link" aria-label="Goto page 47" onClick={() => setCurrentPage(currentPage+1)}>{currentPage+1}</a></li>
              ) : <></>
            }
            {
              currentPage < (matchedtokens.length/pageSize)-2 ? (
                <>
                  <li><span className="pagination-ellipsis">&hellip;</span></li>
                </>
              ) : <></>
            }
            {
              currentPage < (matchedtokens.length/pageSize)-1 ? (
                <li><a className="pagination-link" aria-label="Goto page 86" onClick={() => setCurrentPage(parseInt(matchedtokens.length/pageSize)+1)}>{parseInt(matchedtokens.length/pageSize)+1}</a></li>
              ) : <></>
            }
          </ul>
        </nav>
      ) : <></>
    }

  </div>
  );
}

const NoAssetFound = ({state_collection, policyIds}) => {
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
            !state_collection.loading && policyIds ? policyIds.some(r=> Object.keys(state_collection.policies_collections).indexOf(r) >= 0) ? (
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
            ) : <></> : <></>
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
    opencnft_get_policy: (policy_id, callback) => dispatch(opencnft_get_policy(policy_id, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Collection);
