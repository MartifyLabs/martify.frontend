import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

const AssetCard = ({asset, column_class}) => {
  return (
    <>
    {
      asset ? (
        <>
        {
          asset.info.onchainMetadata ? (
            <div className={column_class?column_class:"column is-one-full-mobile is-half-tablet one-quarter-desktop is-one-quarter-widescreen is-one-quarter-fullhd"}>
              <Link to={`/assets/${asset.info.policyId}/${asset.info.asset}`}>
                <div className="card asset_card">
                  <div className="card-image">
                    <figure className="image is-square">
                      <img src={"https://ipfs.blockfrost.dev/ipfs/"+asset.info.onchainMetadata.image} alt={asset.info.onchainMetadata.assetName}/>
                    </figure>
                  </div>
                  <div className="card-content">
                    <div className="media is-clipped">
                      <div className="media-content clipped">
                        <p className="title is-4 clipped">{asset.info.onchainMetadata.name}</p>
                        <p className="subtitle is-6 clipped">
                          {
                            asset.collection.is_verified ? asset.collection.meta.name : asset.info.policyId
                          }
                        </p>
                        {
                          asset.listing.is_listed ? <p className="subtitle is-6">₳{asset.listing.price}</p> : <></>
                        }
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
