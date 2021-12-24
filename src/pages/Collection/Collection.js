import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

import { usePolicyMetadatas } from "hooks/usePolicyMetadatas";
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

  const [policyIds, setPolicyIds] = useState([]);
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

      setPolicyIds(currentCollectionIterator.policy_ids);
      if (currentCollectionIterator.id !== thisCollection.id) {
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
              policyIds={policyIds}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const ListingSection = ({ state_collection, policyIds }) => {
  const ITEMS_PER_PAGE = 48;
  const dispatch = useDispatch();
  const [listings, setListings] = useState([]);
  const [totalMinted, setTotalMinted] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [paginationObject, setPaginationObject] = useState(undefined);
  const [policyMetadatas, loadingData] = usePolicyMetadatas(policyIds);

  const resetComponentState = useCallback(() => {
    if (policyMetadatas.length > 0) {
      let tmpTotalMinted = 0;
      let tmpPaginationObject = {};
      for (let metadata of policyMetadatas) {
        if (metadata) {
          tmpPaginationObject[metadata.policy] = {
            page: 1,
            hasMore: true,
            itemsMinted: metadata.asset_minted,
            policyId: metadata.policy,
          };
          tmpTotalMinted += metadata.asset_minted;
        }
      }
      setListings([]);
      setTotalMinted(tmpTotalMinted);
      setPaginationObject(tmpPaginationObject);
    }
  }, [policyMetadatas]);

  const updateComponentState = (collectionMetadata, loadedAssets) => {
    setListings([...listings, ...loadedAssets]);
    setPaginationObject({
      ...paginationObject,
      [collectionMetadata.policyId]: {
        ...collectionMetadata,
        page: collectionMetadata.page + 1,
        hasMore: loadedAssets.length > 0,
      },
    });
  };

  const getLastVisible = () => {
    const lastItem = listings[listings.length - 1];
    if (lastItem) {
      return lastItem?.details?.readableAssetName;
    }
    return "";
  };

  const hasMore = () => {console.log(paginationObject);
    if (listings.length < totalMinted && paginationObject !== undefined) {
      for (let key of Object.keys(paginationObject)) {
        if (paginationObject[key].hasMore) {
          return paginationObject[key];
        }
      }
    }
    return false;
  };

  const loadNext = () => {
    const collectionMetadata = hasMore();
    if (!isFetching && collectionMetadata) {
      setIsFetching(true);
      dispatch(
        get_listings(
          collectionMetadata.policyId,
          collectionMetadata.page,
          ITEMS_PER_PAGE,
          getLastVisible(),
          (loadedAssets) => {
            updateComponentState(collectionMetadata, loadedAssets);
            setIsFetching(false);
          }
        )
      );
    }
  };

  useEffect(() => {
    if (!isFetching && listings.length === 0) loadNext();
  });

  useEffect(() => {
    if (policyMetadatas?.length > 0) {
      resetComponentState();
    } else {
      setListings([]);
      setTotalMinted(0);
      setPaginationObject(undefined);
    }
  }, [resetComponentState, policyMetadatas]);

  return (
    <>
      {!loadingData && listings.length > 0 ? (
        <InfiniteScroll
          className="infinite-scroll-container"
          dataLength={listings.length}
          next={loadNext}
          hasMore={totalMinted > listings.length}
          loader={
            <progress
              className="progress is-small is-primary"
              max="100"
            ></progress>
          }
          endMessage={
            <div style={{ textAlign: "center" }}>
              <span className="icon has-text-info">
                <i className="fas fa-info-circle"></i>
              </span>
              <b>Yay! You have seen it all</b>
            </div>
          }
          scrollableTarget="body"
        >
          <DisplayListing listings={listings} />
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

const DisplayListing = ({ listings }) => {
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
