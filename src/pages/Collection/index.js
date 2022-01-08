import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import ListingSection from "./ListingSection";

import { opencnft_get_policy } from "store/collection/api";
import { CollectionAbout, CollectionBanner } from "components";

import "./style.css";

const Collection = () => {
  const { collection_id } = useParams();
  const dispatch = useDispatch();
  const state_collection = useSelector((state) => state.collection);
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

      if (currentCollectionIterator.hasOwnProperty("policy_ids")) {
        setPolicyIds(currentCollectionIterator.policy_ids);
      }

      if (currentCollectionIterator.id !== thisCollection.id) {
        setThisCollection({ ...currentCollectionIterator });

        if (currentCollectionIterator.hasOwnProperty("policy_id")) {
          setPolicyIds([currentCollectionIterator.policy_id]);
        }

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
        is_collection_page={true}
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

export default Collection;
