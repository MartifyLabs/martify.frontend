import React, { useEffect, useState, useMemo } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { load_collection, get_listings } from "../../store/collection/api";
import AssetCard from "../../components/AssetCard";
import CollectionAbout from "../../components/CollectionAbout";
import CollectionBanner from "../../components/CollectionBanner";

import "./style.css";

const Collection = ({state_collection, collection_id, get_listings}) => {
  
  const [policyIds, setPolicyIds] = useState(false);

  const default_meta = {
    policy_id: false,
    meta: {

    },
    style: {
      font_color_title: "#333",
      banner_path: false
    },
    links: {}
  };
  const [thisCollection, setThisCollection] = useState(default_meta);
  
  useEffect(() => {
    if(state_collection.loaded){
      if(collection_id in state_collection.collections || collection_id in state_collection.policies_collections){
  
        if(collection_id in state_collection.collections){
          var policy_id = state_collection.collections[collection_id].policy_id;
          setPolicyIds(policy_id);
        }else{
          setPolicyIds(collection_id);
        }
        
        var tmp = {...default_meta, ...state_collection.collections[collection_id]};
        setThisCollection(tmp);
      }
      else{
        var tmp = {...default_meta};
        tmp.policy_id = collection_id;
        setPolicyIds(collection_id);
        setThisCollection(tmp);
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

      <CollectionBanner thisCollection={thisCollection} size={thisCollection.style.banner_path?"is-medium":"is-small"} />
      
      <section className="section">
        <div className="columns">
          
          <div className="column is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd">
            <div className="block">
              { thisCollection ? <CollectionAbout thisCollection={thisCollection} /> : <></> }
            </div>
          </div>
      
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
      var policy_id = policyIds[i]
      if(policy_id in state_collection.policies_assets){
        let tmp = Object.values(state_collection.policies_assets[policy_id]);
        tmp_list.push(...tmp);
      }
    }
    setListings(tmp_list);
  }

  useEffect(() => {
    load()
  }, [policyIds, state_collection]);

  useEffect(() => {
    load()
  }, []);

return (
  <>
  {
    listings.length > 0 ? <DisplayListing listings={listings} /> : <></>
  }
  {
    listings.length == 0 ? <NoAssetFound state_collection={state_collection} policyIds={policyIds} /> : <></>
  }
  </>
  );
}

const DisplayListing = ({listings}) => {

  //pagination
  const pageSize = 8;
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

      if(x.info.onchainMetadata==null){
        return false
      }

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
  .filter((this_nft, i) => {
    let current_index_min = ((currentPage-1)*pageSize)
    let current_index_max = (currentPage*pageSize)
    if(i>=current_index_min && i<current_index_max){
      return true;
    }
    return false;
  })
  .sort((a, b) => {
    let a_price = a.listing.price!=undefined ? a.listing.price : 999999;
    let b_price = b.listing.price!=undefined ? b.listing.price : 999999;

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
          <button className="pagination-previous" onClick={() => setCurrentPage(currentPage-1)} disabled={currentPage==1}>Previous</button>
          <button className="pagination-next" onClick={() => setCurrentPage(currentPage+1)} disabled={currentPage==(matchedtokens.length/pageSize)}>Next page</button>
          <ul className="pagination-list">
            {
              currentPage!=1?(
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
                <li><a className="pagination-link" aria-label="Goto page 86">{(matchedtokens.length/pageSize)}</a></li>
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
            !state_collection.loading && policyIds ? policyIds.some(r=> Object.keys(state_collection.policies_assets).indexOf(r) >= 0) ? (
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
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Collection);
