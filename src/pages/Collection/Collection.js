import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { get_listings, opencnft_get_policy } from "store/collection/api";

import { AssetCard, CollectionAbout, CollectionBanner } from "components";
import "./style.css";

function throttle(func, wait = 2000) {
  let time = Date.now();
  return function() {
    if ((time + wait - Date.now()) < 0) {
      func();
      time = Date.now();
    }
  }
}

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

  const [policyIds, setPolicyIds] = useState(undefined);
  // const [paginationObject, setPaginationObject] = useState({})
  const [thisCollection, setThisCollection] = useState(default_meta);

  useEffect(() => {
    if (state_collection.loaded) {
      let policy_ids = false;
      let currentCollectionIterator = undefined;

      if (collection_id in state_collection.collections) {
        currentCollectionIterator = {
          ...default_meta,
          ...state_collection.collections[collection_id],
        };
        policy_ids = currentCollectionIterator.policy_ids;
      } else if (collection_id in state_collection.policies_collections) {
        currentCollectionIterator = {
          ...default_meta,
          ...state_collection.policies_collections[collection_id],
        };
        policy_ids = [collection_id];
      } else {
        currentCollectionIterator = {
          ...default_meta,
          id: collection_id,
          policy_id: collection_id,
        };
        policy_ids = [collection_id];
      }

      if (currentCollectionIterator.id !== thisCollection.id) {
        setPolicyIds(policy_ids);
        setThisCollection({ ...currentCollectionIterator });

        for (let policyIdx in policy_ids) {
          let policy_id = policy_ids[policyIdx];
          dispatch(
            opencnft_get_policy(policy_id, (res) => {
              if (res.data.statusCode === 404) {
              } else {
                if (!("opencnft" in currentCollectionIterator)) {
                  currentCollectionIterator.opencnft = [];
                }
                currentCollectionIterator.opencnft.push(res.data);
                setThisCollection({ ...currentCollectionIterator });
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
  const ITEMS_PER_PAGE = 23;
  const dispatch = useDispatch();
  const [listings, setListings] = useState([]);
  const [currentPolicy, setCurrentpolicy] = useState("bla");
  const [isFetching, setIsFetching] = useState(false);
  const [paginationObject, setPaginationObject] = useState(null);
  // define an object that can be accessed from thr event listener
  const myStateRef = React.useRef(paginationObject);

  const myStateRefListing = React.useRef(listings);

  const setMyStateRefListing = (data) => {
    myStateRefListing.current = data;
    setListings(data);
  };
  const setMyStatePage = (data) => {
    myStateRef.current = data;
    console.log(data);
    setPaginationObject(data);
  };
  // console.log(paginationObject)
  const onScroll = useCallback((ev) => {
    if (window) {
      if (
        window.innerHeight + window.scrollY + 100 >
        document.body.offsetHeight
      ) {
        if (!isFetching) {
          loadNextPage();
        }
      }
    }
  }, []);

  const findCurrentLoadingPolicy = () => {
    if (myStateRef.current) {
      for (let objKey of Object.keys(myStateRef.current)) {
        console.log(objKey);
        if (
          myStateRef.current[objKey].itemsCap >
          myStateRef.current[objKey].itemsLoaded
        ) {
          return myStateRef.current[objKey];
        }
      }
    }
    return null;
  };

  const loadNextPage = () => {
    setIsFetching(true);
    let currentPolicy = findCurrentLoadingPolicy();
    let listingsRef = myStateRefListing.current;
    dispatch(
      get_listings(
        currentPolicy._id,
        currentPolicy.page,
        ITEMS_PER_PAGE,
        listingsRef && listingsRef.length > 0
          ? listingsRef[listingsRef.length - 1].details.readableAssetName
          : "",
        (countLoadedAssets) => {
          let currentItemsLoaded = myStateRef.current[currentPolicy._id];
          currentItemsLoaded["itemsLoaded"] =
            currentPolicy.itemsLoaded + countLoadedAssets;
          currentItemsLoaded["page"] = currentPolicy.page + 1;
          let newObj = {};
          newObj[currentPolicy._id] = currentItemsLoaded;
          setMyStatePage(newObj);
          setIsFetching(false);
        }
      )
    );
  };

  //and effect that boostraps the first collection
  useEffect(() => {
    if (paginationObject !== null && !isFetching) {
      loadNextPage();
    }
  }, [paginationObject]);

  useEffect(() => {
    if (policyIds && thisCollection.opencnft) {
      let tmpPaginationObj = {};
      for (let policy of policyIds) {
        let opencnftItem = thisCollection.opencnft.find(
          (it) => it.policy === policy
        );
        tmpPaginationObj[policy] = {
          page: 1,
          itemsLoaded: 0,
          itemsCap: opencnftItem.asset_minted,
          _id: policy,
        };
      }
      setMyStatePage(tmpPaginationObj);
    }
  }, [policyIds, thisCollection]);

  const load = () => {
    setMyStateRefListing([]);
    let tmp_list = [];
    for (let i in policyIds) {
      let policy_id = policyIds[i];
      if (policy_id in state_collection.policies_assets) {
        let tmp = Object.values(state_collection.policies_assets[policy_id]);
        tmp_list.push(...tmp);
      }
    }
    setMyStateRefListing(tmp_list);
  };

  useEffect(() => {
    load();
  }, [policyIds, state_collection]);

  useEffect(() => {
    window.addEventListener(
      "scroll",
      throttle(() => onScroll())
    );
    return () =>
      window.removeEventListener(
        "scroll",
        throttle(() => onScroll())
      );
  }, [onScroll]);

  return (
    <>
      {listings.length > 0 ? (
        <DisplayListing
          state_collection={state_collection}
          listings={listings}
          currentPolicy={currentPolicy}
          setCurrentpolicy={setCurrentpolicy}
          thisCollection={thisCollection}
          paginationObject={paginationObject}
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

const DisplayListing = ({
  state_collection,
  listings,
  setCurrentpolicy,
  thisCollection,
}) => {
  const [currentpolicyPage, setCurrentpolicyPage] = useState({});

  // search and filter
  const [searchText, setSearchText] = useState("");
  const [sortby, setSortby] = useState("lowtohigh");
  const [allAssetsMinted, setAllAssetsMinted] = useState(0);

  const sort_options = [
    { value: "lowtohigh", label: "Price: Low to High" },
    { value: "hightolow", label: "Price: High to Low" },
  ];

  useEffect(() => {
    if (thisCollection.opencnft) {
      let overallAssets = 0;
      for (let collection of thisCollection.opencnft) {
        overallAssets += collection.asset_minted;
      }
      setAllAssetsMinted(overallAssets);
    }
  }, [thisCollection.opencnft]);

  useEffect(() => {
    // time to fetch next page.
    // when we fetch next page, we get back the page data and if the page has more pages.
    // if the policy does not have more pages, we update it.
  }, [currentpolicyPage]);

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
