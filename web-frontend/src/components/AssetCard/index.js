import React from "react";
import { Link } from "react-router-dom";
import "./style.css";
import AssetImageFigure from "../AssetImageFigure";

const AssetCard = ({asset, column_className, show_offer}) => {
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
                    <AssetImageFigure asset={asset}/>
                  </div>
                  <div className="card-content">
                    {
                      asset.listing.is_listed ? 
                      <span className="tag is-link is-medium is-rounded price_tag">
                        <p className="" data-tooltip={`Buy now for ₳${asset.listing.price}`}><span className="ada_symbol">₳</span>{asset.listing.price}</p>
                      </span> : <></>
                    }
                    {
                      show_offer ? asset.offers ? Object.keys(asset.offers).length ? (
                        <span className="tag is-warning is-medium is-rounded price_tag" style={{top:"50px"}}>
                          <p className="" data-tooltip={`Highest offer`}>
                            <span className="ada_symbol">₳</span>
                            {
                              Math.max.apply(Math, Object.keys(asset.offers).map(function(key){
                                return asset.offers[key];
                              }).map(function(o) { return o.p; }))
                            }
                          </p>
                        </span>
                      ) : <></> : <></> : <></>
                    }

                    <div className="media is-clipped">
                      <div className="media-content clipped">
                        <p className="subtitle is-size-7 clipped">
                          {asset.collection.is_martify_verified ? asset.collection.meta.name : 
                          asset.collection.is_cnft_verified ? asset.collection.is_cnft_verified :
                          asset.info.policyId
                          }
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
