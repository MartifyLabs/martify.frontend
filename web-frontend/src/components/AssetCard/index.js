import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

const AssetCard = ({token}) => {  
  console.log(token)
  return (
    <Link to={`/assets/${token.info.policyId}/${token.info.asset}`}>
      <div className="card asset_card">
        <div className="card-image">
          <figure className="image is-square">
            <img src={"https://ipfs.blockfrost.dev/ipfs/"+token.info.onchainMetadata.image} alt={token.info.assetName}/>
          </figure>
        </div>
        <div className="card-content">
          <div className="media">
            <div className="media-content">
              <p className="title is-4">{token.info.onchainMetadata.name}</p>
              {
                token.collection.is_verified ? <p className="subtitle is-6">{token.collection.meta.name}</p> : <></>
              }
              {
                token.listing.is_listed ? <p className="subtitle is-6">₳{token.listing.price}</p> : <></>
              }
            </div>
          </div>
  {/* 
          <div className="content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Phasellus nec iaculis mauris. <a>@bulmaio</a>.
            <a href="#">#css</a> <a href="#">#responsive</a>
          </div> */}
        </div>
      </div>
    </Link>
  )
};

export default AssetCard;
