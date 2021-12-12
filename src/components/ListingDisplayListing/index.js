import React, { useEffect, useState} from "react";
import AssetCard from "../AssetCard";

const ListingDisplayListing = ({listings}) => {
  //pagination
  const pageSize = 16;
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

      if(x.details.onchainMetadata===null){
        return false
      }

      if (searchText === "") {
        return_this = true;
      }
      else if (
        searchText !== "" &&
        (
          x.details.onchainMetadata.name.toLowerCase().includes(searchText.toLowerCase())
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
    let a_price = a.status.datum.price!==undefined ? a.status.datum.price : 999999;
    let b_price = b.status.datum.price!==undefined ? b.status.datum.price : 999999;

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
          <button className="pagination-previous" onClick={() => setCurrentPage(currentPage-1)} disabled={currentPage===1}>Previous</button>
          <button className="pagination-next" onClick={() => setCurrentPage(currentPage+1)} disabled={currentPage===(matchedtokens.length/pageSize)}>Next page</button>
          <ul className="pagination-list">
            {
              currentPage!==1?(
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
                <li><a className="pagination-link" aria-label="Goto page 86" onClick={() => setCurrentPage(parseInt(matchedtokens.length/pageSize)+1)}>{parseInt(matchedtokens.length/pageSize)+1}</a></li>
              ) : <></>
            }
          </ul>
        </nav>
      ) : <></>
    }

  </div>
  );
};

export default ListingDisplayListing;
