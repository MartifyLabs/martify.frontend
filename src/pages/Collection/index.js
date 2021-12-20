import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { get_listings, opencnft_get_policy } from "store/collection/api";

import { AssetCard, CollectionAbout, CollectionBanner } from "components";

import "./style.css";

const Collection = () => {
  const { collection_id } = useParams();
  const state_collection = useSelector((state) => state.collection);
  const dispatch = useDispatch();

  const default_meta = {
    id: "",
    meta: {},
    style: {
      font_color_title: false,
      banner_path: false,
    },
    links: {},
  };

  const [policyIds, setPolicyIds] = useState(false);
  const [thisCollection, setThisCollection] = useState(default_meta);

  useEffect(() => {
    if (state_collection.loaded) {
      let policy_ids = false;
      var this_collection = false;

      if (collection_id in state_collection.collections) {
        this_collection = {
          ...default_meta,
          ...state_collection.collections[collection_id],
        };
        policy_ids = this_collection.policy_ids;
      } else if (collection_id in state_collection.policies_collections) {
        this_collection = {
          ...default_meta,
          ...state_collection.policies_collections[collection_id],
        };
        policy_ids = [collection_id];
      } else {
        this_collection = {
          ...default_meta,
          id: collection_id,
          policy_id: collection_id,
        };
        policy_ids = [collection_id];
      }

      if (this_collection.id !== thisCollection.id) {
        setPolicyIds(policy_ids);
        setThisCollection({ ...this_collection });

        for (var i in policy_ids) {
          var policy_id = policy_ids[i];
          dispatch(
            opencnft_get_policy(policy_id, (res) => {
              if (res.data.statusCode === 404) {
              } else {
                if (!("opencnft" in this_collection)) {
                  this_collection.opencnft = [];
                }
                this_collection.opencnft.push(res.data);
                setThisCollection({ ...this_collection });
              }
            })
          );
        }
      }
    }
  }, [state_collection, collection_id]);

  return (
    <div className="collection">
      <CollectionBanner
        thisCollection={thisCollection}
        size={thisCollection.is_martify_verified ? "is-medium" : "is-small"}
      />

      <section className="section">
        <div className="columns">
          {thisCollection.is_martify_verified ||
          thisCollection.is_cnft_verified ? (
            <div className="column is-one-quarter-tablet one-fifth-desktop is-one-fifth-widescreen is-one-fifth-fullhd">
              <div className="block">
                <CollectionAbout thisCollection={thisCollection} />
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="column">
            <ListingSection
              state_collection={state_collection}
              thisCollection={thisCollection}
              policyIds={policyIds}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const ListingSection = ({ state_collection, thisCollection, policyIds }) => {
  const dispatch = useDispatch();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (thisCollection.opencnft) {
      dispatch(get_listings(policyIds.at(0), (res) => {}))
    }
  }, [thisCollection]);

  function load() {
    setListings([]);
    let tmp_list = [];
    for (var i in policyIds) {
      var policy_id = policyIds[i];
      if (policy_id in state_collection.policies_assets) {
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
      {listings.length > 0 ? (
        <DisplayListing
          state_collection={state_collection}
          listings={listings}
        />
      ) : (
        <></>
      )}
      {listings.length === 0 ? (
        <NoAssetFound
          state_collection={state_collection}
          policyIds={policyIds}
        />
      ) : (
        <></>
      )}
    </>
  );
};

const DisplayListing = ({ state_collection, listings }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // search and filter
  const [searchText, setSearchText] = useState("");
  const [sortby, setSortby] = useState("lowtohigh");
  const sort_options = [
    { value: "lowtohigh", label: "Price: Low to High" },
    { value: "hightolow", label: "Price: High to Low" },
  ];

  const searchingFor = (searchText) => {
    return (x) => {
      let return_this = false;

      if (x.details.onchainMetadata == null) {
        return false;
      }

      if (searchText === "") {
        return_this = true;
      } else if (
        searchText !== "" &&
        x.details.onchainMetadata.name
          .toLowerCase()
          .includes(searchText.toLowerCase())
      ) {
        return_this = true;
      }
      return return_this;
    };
  };

  let matchedtokens = listings.filter(searchingFor(searchText));

  const filtered_listing = matchedtokens
    .sort((a, b) => {
      let a_price = a.listing.price !== undefined ? a.listing.price : 999999;
      let b_price = b.listing.price !== undefined ? b.listing.price : 999999;

      if (sortby === "lowtohigh") {
        return a_price - b_price;
      } else {
        return b_price - a_price;
      }
    })
    .map((this_nft, i) => {
      return <AssetCard asset={this_nft} key={i} />;
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
            <select
              value={sortby}
              onChange={(event) => setSortby(event.target.value)}
            >
              {sort_options.map((option, i) => {
                return (
                  <option value={option.value} key={i}>
                    {option.label}
                  </option>
                );
              })}
            </select>
          </span>
        </div>
      </div>
      <div className="columns is-multiline">{filtered_listing}</div>
      <button
        className={
          "button is-rounded is-info" +
          (state_collection.loading ? " is-loading" : "")
        }
        disabled={state_collection.loading}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <span>Load More...{currentPage}</span>
      </button>
    </div>
  );
};

const NoAssetFound = ({ state_collection, policyIds }) => {
  return (
    <section className="hero is-medium">
      <div className="hero-body">
        <div className="container has-text-centered">
          {state_collection.loading ? (
            <>
              <h1>
                <span
                  className="icon"
                  style={{ fontSize: "100px", marginBottom: "50px" }}
                >
                  <i className="fas fa-truck-loading"></i>
                </span>
              </h1>
              <p className="title">Fetching assets</p>
              <p className="subtitle">This may take awhile...</p>
            </>
          ) : (
            <></>
          )}
          {!state_collection.loading && policyIds ? (
            policyIds.some(
              (r) =>
                Object.keys(state_collection.policies_collections).indexOf(r) >=
                0
            ) ? (
              <>
                <h1>
                  <span
                    className="icon"
                    style={{ fontSize: "100px", marginBottom: "50px" }}
                  >
                    <i className="far fa-times-circle"></i>
                  </span>
                </h1>
                <p className="title">No assets</p>
                <p className="subtitle">
                  This policy ID does not exist or does not contain any assets.
                </p>
              </>
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
        </div>
      </div>
    </section>
  );
};

export default Collection;
