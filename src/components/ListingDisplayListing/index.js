import React, { useState } from "react";
import AssetCard from "../AssetCard";

const ListingDisplayListing = ({ listings }) => {
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

      if (x.details.onchainMetadata === null) {
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
      let a_price =
        a.status.datum.price !== undefined ? a.status.datum.price : 999999;
      let b_price =
        b.status.datum.price !== undefined ? b.status.datum.price : 999999;

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

export default ListingDisplayListing;
