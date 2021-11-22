import React from "react";
import { get_asset_image_source } from "../../utils";

const AssetImageFigure = ({asset, setShow, show_trigger, width, no_figure, className}) => {
  return (
    <>
    {
      no_figure ? (
        <img className={className} src={get_asset_image_source(asset.details.onchainMetadata.image)} alt={asset.details.onchainMetadata.name} style={{width:width, height: width}}/>
      ) :
      setShow ? (
        <figure className="image is-square" onClick={() => setShow(show_trigger?show_trigger:false)} style={{cursor:"pointer"}}>
          <img src={get_asset_image_source(asset.details.onchainMetadata.image)} alt={asset.details.onchainMetadata.name} style={{width:width, height: width}}/>
        </figure>
      ) : (
        <figure className="image is-square">
          <img src={get_asset_image_source(asset.details.onchainMetadata.image)} alt={asset.details.onchainMetadata.name} style={{width:width, height: width}}/>
        </figure>
      )
    }
    </>
  )
}

export default AssetImageFigure;
