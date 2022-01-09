import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";

import DisplayListing from "./DisplayListing";
import NoAssetFound from "./NoAssetFound";

import { usePolicyMetadatas } from "hooks/usePolicyMetadatas";
import { get_listings } from "store/collection/api";

const ListingSection = ({ state_collection, policyIds }) => {
  const ITEMS_PER_PAGE = 48;
  const dispatch = useDispatch();
  const [listings, setListings] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [paginationObject, setPaginationObject] = useState(undefined);
  const [policyMetadatas, loadingData] = usePolicyMetadatas(policyIds);

  const resetComponentState = useCallback(() => {
    if (policyMetadatas.length > 0) {
      let tmpPaginationObject = {};
      for (let metadata of policyMetadatas) {
        if (metadata) {
          tmpPaginationObject[metadata.policy] = {
            page: 1,
            hasMore: true,
            itemsMinted: metadata.asset_minted,
            policyId: metadata.policy,
          };
        }
      }
      setListings([]);
      setLastVisible(null);
      setPaginationObject(tmpPaginationObject);
    }
  }, [policyMetadatas]);

  const updateComponentState = (collectionMetadata, loadedAssets) => {
    setListings([...listings, ...loadedAssets]);
    setLastVisible(loadedAssets[loadedAssets.length - 1]);
    setPaginationObject({
      ...paginationObject,
      [collectionMetadata.policyId]: {
        ...collectionMetadata,
        page: collectionMetadata.page + 1,
        hasMore:
          ITEMS_PER_PAGE * collectionMetadata.page <
          collectionMetadata.itemsMinted,
      },
    });
  };

  const hasMore = () => {
    if (paginationObject !== undefined) {
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
          lastVisible,
          (res) => {
            if (res.success) {
              updateComponentState(collectionMetadata, res.data);
              setIsFetching(false);
            }
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
          hasMore={hasMore()}
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

export default ListingSection;
