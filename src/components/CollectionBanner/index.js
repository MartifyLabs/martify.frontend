import React, { useEffect, useState} from "react";

import {usePalette} from 'react-palette'

import CollectionLinks from "../CollectionLinks";
import { numFormatter, get_asset_image_source } from "../../utils";

const CollectionBanner = ({thisCollection, size, asset}) => {
  
  const [currentId, setCurrentId] = useState(false);
  const [assetImgSrc, setAssetImgSrc] = useState(false);
  const [assetColors, setAssetColors] = useState({});

  useEffect(() => {
    if(asset && currentId!==thisCollection.id){
      let imgsrc = get_asset_image_source(asset.details.onchainMetadata.image);
      setAssetImgSrc(imgsrc);
    }
  }, [asset]);

  useEffect(() => {
    if(asset===undefined && ("opencnft" in thisCollection) && currentId!==thisCollection.id){
      setCurrentId(thisCollection.id);
      if(thisCollection.opencnft.length>0){
        if(thisCollection.opencnft[0].thumbnail){
          let imgsrc = get_asset_image_source(thisCollection.opencnft[0].thumbnail);
          setAssetImgSrc(imgsrc);
        }
      }
    }
  }, [thisCollection]);

  const { data, loading, error } = usePalette(assetImgSrc?assetImgSrc:"");
  if(assetImgSrc && !loading && Object.keys(data).length>0 && Object.keys(assetColors).length===0){
    setAssetColors(data)
  }
  // {
  //   darkMuted: "#2a324b"
  //   darkVibrant: "#0e7a4b"
  //   lightMuted: "#9cceb7"
  //   lightVibrant: "#a4d4bc"
  //   muted: "#64aa8a"
  //   vibrant: "#b4d43c"
  // }
  

  return (
    <section className={"hero collection_name " + (size!==undefined ? size : "is-medium")} 
    style={
      thisCollection.style ? 
        thisCollection.style.banner_path ? 
          {backgroundImage: `url(${thisCollection.style.banner_path})`} : 
        assetColors ? 
          {backgroundImage: `linear-gradient(to bottom right, ${assetColors.darkMuted}, ${assetColors.darkVibrant}`} : 
        {} : 
      assetColors ? 
        {backgroundImage: `linear-gradient(to bottom right, ${assetColors.darkMuted}, ${assetColors.darkVibrant}`} : 
      {}
    }>

      <div className="hero-body">
      
        <nav className="level">
            <div className="level-left">
              {
                thisCollection.style ? thisCollection.style.logo_path ? (
                  <div className="level-item">
                    <figure className="image is-128x128">
                      <img className="collection_logo is-rounded image is-128x128" src={thisCollection.style.logo_path} alt="" />
                    </figure>
                  </div>
                ) : <></>
                : <></>
              }
              <div className="level-item">
                <div className="collection_title">
                  {
                    thisCollection.meta.name ? (
                      <TitleText size="is-size-1" text={thisCollection.meta.name} thisCollection={thisCollection} assetColors={assetColors} />
                    ) : (
                      <>
                      <p className="title is-size-2" style={{color: thisCollection.style ? thisCollection.style.font_color_title ? thisCollection.style.font_color_title : "#333" : "#333"}}>
                      Browsing results for
                      </p>
                      <p className="title is-size-4" style={{color: thisCollection.style ? thisCollection.style.font_color_title ? thisCollection.style.font_color_title : "#333" : "#333"}}>
                        {thisCollection.policy_id}
                      </p>
                      </>
                    )
                  }
                </div>
              </div>
            </div>

          <div className="level-right">
            {
              thisCollection.opencnft ? (
                <div className="level-item">
                  <table className="table is-bordered">
                    <tbody>
                      <tr>
                        <td>
                          <div className="has-text-centered">
                            <div>
                              <p className="heading has-text-weight-semibold">Volume traded</p>
                              <p className="is-size-4">
                                ₳{numFormatter(
                                (thisCollection.opencnft.reduce(function (result, policy){
                                  return result + policy.total_volume
                                },0)/1000000)
                                )}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="has-text-centered">
                            <div>
                              <p className="heading has-text-weight-semibold">Floor price</p>
                              <p className="is-size-4">
                                ₳{
                                thisCollection.opencnft.reduce(function (result, policy){
                                  return Math.min(result, policy.floor_price)
                                },999999*1000000)/1000000}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="has-text-centered">
                            <div>
                              <p className="heading has-text-weight-semibold">Total assets</p>
                              <p className="is-size-4">
                                {
                                  thisCollection.opencnft.reduce(function (result, policy){
                                    return result + policy.asset_minted
                                  },0)
                                }
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="has-text-centered">
                            <div>
                              <p className="heading has-text-weight-semibold">Number owners</p>
                              <p className="is-size-4">
                                {
                              thisCollection.opencnft.reduce(function (result, policy){
                                  return result + policy.asset_holders
                                },0)
                              }
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="has-text-centered">
                            <div>
                              <p className="heading has-text-weight-semibold">Total transactions</p>
                              <p className="is-size-4">
                                {numFormatter(
                                thisCollection.opencnft.reduce(function (result, policy){
                                  return result + policy.total_tx
                                },0))
                                }
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : <></>
            }

            <div className="level-item">
              <CollectionLinks collection={thisCollection} />
            </div>
          </div>
        </nav>

      </div>
    </section>
  );
};

const TitleText = ({size, text, thisCollection, assetColors}) => {
  return (
    <p className={"title " + (size?size:"")} style={{color: thisCollection.style ? thisCollection.style.font_color_title ? thisCollection.style.font_color_title : 
      assetColors ? `#FFF` : `#FFF` : assetColors ? `#FFF` : `#FFF`}}>
      {thisCollection.meta.name}
    </p>
  )
}

export default CollectionBanner;
