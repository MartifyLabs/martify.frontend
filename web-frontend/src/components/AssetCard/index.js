import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

const AssetCard = ({asset, column_className}) => {
  return (
    <>
    {
      asset ? (
        <>
        {
          asset.info.onchainMetadata ? (
            <div className={column_className?column_className:"column is-one-full-mobile is-half-tablet one-quarter-desktop is-one-quarter-widescreen is-one-quarter-fullhd"}>
              <Link to={`/assets/${asset.info.policyId}/${asset.info.asset}`}>
                <div className="card asset_card">
                  <div className="card-image">
                    <figure className="image is-square">
                      <img src={"https://ipfs.blockfrost.dev/ipfs/"+asset.info.onchainMetadata.image} alt={asset.info.onchainMetadata.assetName}/>
                    </figure>
                  </div>
                  <div className="card-content">
                    {
                      asset.listing.is_listed ? 
                      <span className="tag is-white is-medium is-rounded price_tag">
                        <p className="">₳{asset.listing.price}</p>
                      </span> : <></>
                    }

                    <div className="media is-clipped">
                      <div className="media-content clipped">
                        <p className="subtitle is-size-7 clipped">
                          {asset.collection.is_verified ? asset.collection.meta.name : asset.info.policyId}
                        </p>
                        <p className="title is-size-5 clipped">
                          {asset.info.onchainMetadata.name}
                        </p>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </Link>
            </div>
          ) : <></>
        }
        </>
      ) : <></>
    }
    </>
  )
};

export default AssetCard;
