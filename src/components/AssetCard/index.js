import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./style.css";
import AssetImageFigure from "../AssetImageFigure";
import { fromLovelace } from "../../utils/converter";

const AssetCard = ({ state_collection, asset, column_className, show_offer }) => {

  let collection = false;
  if (asset) {
    collection = state_collection.policies_collections[asset.details.policyId]
  }

  return (
    <>
      {
        asset ? (
          <>
            {
              asset.details.onchainMetadata ? (
                <div className={column_className ? column_className : "column is-one-full-mobile is-half-tablet one-quarter-desktop is-one-quarter-widescreen is-one-quarter-fullhd"}>
                  <Link to={`/assets/${asset.details.policyId}/${asset.details.asset}`}>
                    <div className="card asset_card">
                      <div className="card-image">
                        <AssetImageFigure asset={asset} />
                      </div>
                      <div className="card-content">
                        <div className="media is-clipped">
                          <div className="media-content clipped">
                            <p className="title is-size-5 clipped">
                              {asset.details.onchainMetadata.name}
                            </p>
                            <p className="subtitle is-size-7 clipped">
                              {collection ? collection.is_martify_verified ? collection.meta.name :
                                collection.is_cnft_verified ? collection.meta.name :
                                  asset.details.policyId : asset.details.policyId
                              }
                              {collection ? collection.is_martify_verified ? (
                                <span className="icon" data-tooltip="Martify Verified">
                                  <i
                                    className="fas fa-check-circle"
                                    style={{ color: "gold" }}
                                  ></i>
                                </span>
                              ) : collection.is_cnft_verified ? (
                                <span className="icon" data-tooltip="CNFT Verified">
                                  <i
                                    className="fas fa-check-circle"
                                    style={{ color: "green" }}
                                  ></i>
                                </span>
                              ) : (
                                <></>
                              ) : (
                                <></>
                              )}
                            </p>
                            <div className="title is-size-5 tag-price">
                              {
                                asset.status.locked ?
                                  <p>{fromLovelace(asset.status.datum.price)}<span className="ada_symbol">&nbsp;₳</span></p>
                                  : <p><span className="ada_symbol">Not Listed</span></p>
                              }
                            </div>
                            {
                              show_offer ? asset.offers ? Object.keys(asset.offers).length ? (
                                <span className="tag is-warning is-medium is-rounded price_tag" style={{ top: "50px" }}>
                                  <p className="" data-tooltip={`Highest offer`}>
                                    <span className="ada_symbol">₳</span>
                                    {
                                      Math.max.apply(Math, Object.keys(asset.offers).map(function (key) {
                                        return asset.offers[key];
                                      }).map(function (o) { return o.p; }))
                                    }
                                  </p>
                                </span>
                              ) : <></> : <></> : <></>
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

function mapStateToProps(state, props) {
  return {
    state_collection: state.collection,
  };
}

function mapDispatchToProps(dispatch) {
  return {
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(AssetCard);
