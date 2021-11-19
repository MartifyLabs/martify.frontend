import React, { useEffect, useState } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { get_listed_assets } from "../../store/collection/api";
import ListingDisplayListing from "../../components/ListingDisplayListing";

const Explore = ({get_listed_assets}) => {

  const [listings, setListings] = useState([]);

  useEffect(() => {
    get_listed_assets((res) => {
      console.log(res.data)
      if(res.data) setListings(res.data);
    });
  }, []);

  return (
    <div className="section">
      <div className="columns">
        {/* <div className="column is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd">
          <Filter listings={listings} setListings={setListings} />
        </div> */}
        <div className="column">
          <ListingSection listings={listings} />
        </div>
      </div>
    </div>
  );
};

const Filter = ({listings, setListings}) => {
  return (
      <div className="card">

        <header className="card-header">
          <p className="card-header-title">
            Collections
          </p>
        </header>
        <div className="card-content">
          <div className="content">
            
            
          <div className="field">
            <input className="is-checkradio" id="exampleCheckboxDefault" type="checkbox" name="exampleCheckboxDefault" checked="checked"/ >
            <label for="exampleCheckboxDefault">Checkbox</label>
          </div>

          </div>
        </div>

{/* 
        <header className="card-header">
          <p className="card-header-title">
            state
          </p>
        </header>
        <div className="card-content">
          <div className="content">
            stuffs
          </div>
        </div>

        <header className="card-header">
          <p className="card-header-title">
            state
          </p>
        </header>
        <div className="card-content">
          <div className="content">
            stuffs
          </div>
        </div> */}


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

