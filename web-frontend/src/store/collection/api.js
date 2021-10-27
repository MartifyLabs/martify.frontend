import {
  collections_loaded,
  collections_add_tokens,
  collections_loading,
} from "./collectionActions";

import data_collections from "../../data/collections.json";

export const load_collection = (callback) => async (dispatch) => {
  dispatch(collections_loaded(data_collections));
  callback({data_collections});
}

let mock = {
  "6c880f643a86d6f5b86871952b36999bbf7e9619ca54953abd2acf62": {
    "PixelHead010": {
      price: 3499,
      meta: {
        "creature name": "Aether",
         image: "Qmdk5vhzDkL7CsXgUkHdM2x6xEiR28E2YXT4LVyxk6t7zY",
         mediaType: "image/gif",
         name: "PixelHead #010",
         narrative: [
            "A Controller of the Sentibot legion, this being is the epitome",
            "of cybernetics technology. What remains of it's original self?",
            "--",
            "The Pixel Head Squad"
         ]
      }
    },
    "PixelHead016": {
      price: 22222,
      meta: {
        "creature name": "Armanto",
        image: "QmTHzijixVhiizqgEK1hzC4M45qJjjXs2byymiY2qugR36",
        mediaType: "image/gif",
        name: "PixelHead #016",
        narrative: [
          "Always skiving off plugging herself into the metaverse, she has",
          "since grown bored of cutting edge entertainment and instead",
          "prefers more vintage selections.",
          "---",
          "The Pixel Head Squad"
        ]
      }
    },
    "PixelHead017": {
      price: 7777,
      meta: {
        "creature name": "High Roller",
        image: "QmWjkMf31dbJcAA4WE4vD9CTVmqXSzMpmRpKeDdMojAKWW",
        mediaType: "image/gif",
        name: "PixelHead #017",
        narrative: [
          "This guy seems too well-kempt to be in this part of the town,",
          "until he whips his deck of cards out for no apparent reason.",
          "Just another weirdo here in Lumion.",
          "---",
          "The Pixel Head Squad"
        ]
      },
    },
  },
  "abc": {
    "Naru03343": {
      price: 1500,
      meta: {
        name: "Yummi Universe - Naru 03343",
        image: "QmXTL9tzs72vjYhkKdaEPqYM2fhPGms2MuKFmp9vowT97q",
      }
    },
  }
};

export const get_listings = (policy_id, callback) => async (dispatch) => {

  // query policy ID, get data
  dispatch(collections_loading(true));
  
  let output = {
    "policy_id": policy_id,
    "listing": mock[policy_id]
  };  
  callback(true);
  dispatch(collections_add_tokens(output));
  
}

export const get_token = (policy_id, token_id, callback) => async (dispatch) => {

  // query, get data
  dispatch(collections_loading(true));
  
  let output = {
    "policy_id": policy_id,
    "listing": {
      [token_id]: mock[policy_id][token_id]
    }
  };  
  callback(true);
  dispatch(collections_add_tokens(output));
  
}