import React from "react";
import { get_asset_image_source } from "../../utils/converter";
import Image from "../../components/Image";
import LazyLoad from 'react-lazyload';
import { FadeImg } from "components/Fades";

const AssetImageFigure = ({ asset, setShow, show_trigger, width, no_figure, className }) => {
  return (
    <>
      {
        no_figure ? (
          <FadeImg className={className} src={get_asset_image_source(asset.details.onchainMetadata.image)} alt={asset.details.onchainMetadata.name} style={{ width: width, height: width }} />
        ) :
          setShow ? (
            <div onClick={() => setShow(show_trigger ? show_trigger : false)} style={{ cursor: "pointer" }}>
              <LazyLoad className="image is-square">
                <Image src={get_asset_image_source(asset.details.onchainMetadata.image)} alt={asset.details.onchainMetadata.name} style={{ width: width, height: width }} />
              </LazyLoad>
            </div>
          ) : (
            <LazyLoad className="image is-square">
              <Image src={get_asset_image_source(asset.details.onchainMetadata.image)} alt={asset.details.onchainMetadata.name} style={{ width: width, height: width }} />
            </LazyLoad>
          )
      }
    </>
  )
}

export default AssetImageFigure;
