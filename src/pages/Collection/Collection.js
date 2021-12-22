import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { get_listings, opencnft_get_policy } from "store/collection/api";
import InfiniteScroll from "react-infinite-scroll-component";

import { AssetCard, CollectionAbout, CollectionBanner } from "components";
import "./style.css";

function throttle(func, wait = 100) {
  let time = Date.now();
  return function () {
    if (time + wait - Date.now() < 0) {
      func();
      time = Date.now();
    }
  };
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
  const ITEMS_PER_PAGE = 24;
  const dispatch = useDispatch();
  const [totalMinted, setTotalMinted] = useState(0);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [listings, setListings] = useState([]);
  const [paginationObject, setPaginationObject] = useState(null);
  const [currentLoadingPolicy, setCurrentLoadingPolicy] = useState({});
  // const [throttleFunc, setThrottleFunc] = useState(null);
  // const throttled = useRef(throttle((newValue) => {
  //   if (!isFetching) loadNextPage();
  // }, 1000))

  // // define objects that can be accessed from the event listener
  // const myStateRef = React.useRef(paginationObject);
  // const myStateRefListing = React.useRef(listings);
  // const myStateRefIsFetching = React.useRef(isFetching);
  // const myThrottleFuncRef = React.useRef(throttleFunc);

  // const setListings = (data) => {
  //   listings = data;
  //   setListings(data);
  // };

  // const setMyStatePage = (data) => {
  //   paginationObject = data;
  //   setPaginationObject(data);
  // };

  // const setMyStateRefIsFetching = (data) => {
  //   myStateRefIsFetching.current = data;
  //   setIsFetching(data);
  // };
  // const setMyThrottleFuncRef = (data) => {
  //   myThrottleFuncRef.current = data;
  //   setThrottleFunc(data);
  // };

  // console.log(paginationObject)
  // const onScroll = () => {

  //   if (window) {
  //     if (
  //       window.innerHeight + window.scrollY + 200 >
  //       document.body.offsetHeight
  //     ) {
  //       throttled.current();
  //     }
  //   }
  // };

  const findCurrentLoadingPolicy = () => {
    if (paginationObject) {
      for (let objKey of Object.keys(paginationObject)) {
        if (
          paginationObject[objKey].itemsCap >
          paginationObject[objKey].itemsLoaded
        ) {
          setCurrentLoadingPolicy(paginationObject[objKey]);
          return paginationObject[objKey];
        }
      }
    }
    return null;
  };

  const loadNextPage = () => {
    if (isFetching) return;
    setIsFetching(true);
    console.log("fetching", paginationObject);
    const currentPolicy = findCurrentLoadingPolicy();
    if (currentPolicy) {
      let lastItem = "";
      if (listings.length > 0) {
        let currentPolicyAssets = listings.filter(
          (a) => a.details.policyId === currentPolicy._id
        );
        if (currentPolicyAssets.length > 0) {
          lastItem =
            currentPolicyAssets[currentPolicyAssets.length - 1].details
              .readableAssetName;
        }
      }
      console.log(lastItem);
      dispatch(
        get_listings(
          currentPolicy._id,
          currentPolicy.page,
          ITEMS_PER_PAGE,
          lastItem,
          (countLoadedAssets) => {
            let currentItemsLoaded = paginationObject[currentPolicy._id];
            currentItemsLoaded["itemsLoaded"] =
              currentPolicy.itemsLoaded + countLoadedAssets;
            let newObj = {};
            newObj[currentPolicy._id] = currentItemsLoaded;
            setTotalLoaded(totalLoaded + countLoadedAssets);
            setPaginationObject({ ...paginationObject, ...newObj });
            setIsFetching(false);
          }
        )
      );
    }
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
        if (opencnftItem) {
          tmpPaginationObj[policy] = {
            page: 1,
            itemsLoaded: 0,
            itemsCap: opencnftItem.asset_minted,
            _id: policy,
          };
          setTotalMinted(totalMinted + opencnftItem.asset_minted);
        }
      }
      setPaginationObject(tmpPaginationObj);
    }
  }, [policyIds, thisCollection]);

  const load = () => {
    // setListings([]);
    let tmp_list = [];
    for (let i in policyIds) {
      let policy_id = policyIds[i];
      if (policy_id in state_collection.policies_assets) {
        let tmp = Object.values(state_collection.policies_assets[policy_id]);
        tmp_list.push(...tmp);
      }
    }
    setListings(tmp_list);
    // setIsFetching(false);
  };

  useEffect(() => {
    load();
  }, [policyIds, state_collection]);

  // useEffect(() => {
  //   setMyThrottleFuncRef(throttle);
  //   window.addEventListener(
  //     "scroll",
  //     onScroll
  //   );
  //   return () =>
  //     window.removeEventListener(
  //       "scroll",
  //       onScroll
  //     );
  // }, []);

  return (
    <>
      {listings.length > 0 && currentLoadingPolicy ? (
        <InfiniteScroll
          className="infinite-scroll-container"
          dataLength={totalLoaded}
          next={loadNextPage}
          hasMore={totalMinted > totalLoaded}
          loader={
            <progress className="progress is-small is-primary" max="100"></progress>
          }
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
          scrollableTarget="body"
        >
          <DisplayListing
            state_collection={state_collection}
            listings={listings}
            thisCollection={thisCollection}
          />
        </InfiniteScroll>
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

const DisplayListing = ({ state_collection, listings, thisCollection }) => {
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
