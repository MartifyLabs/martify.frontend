import React, { useState} from "react";
import useGetAssetImageSrc from "../../utils/useGetAssetImageSrc";

const AssetImageFigure = ({asset, setShow, show_trigger, width, no_figure, className}) => {

  const [assetImgSrc, setAssetImgSrc] = useState(false);

  // function get_src(image){
  //   if(Array.isArray(image)){
  //     image = image.join("");
  //     return image;
  //   }
  //   else if(image.includes("ipfs://ipfs/")){
  //     var i = "https://infura-ipfs.io/ipfs/" + image.split("ipfs://ipfs/")[1];
  //     return i;
  //   }
  //   else if(image.includes("ipfs://")){
  //     var i = "https://infura-ipfs.io/ipfs/" + image.split("ipfs://")[1];
  //     return i;
  //   }
  //   else if(image.length==46){
  //     return "https://infura-ipfs.io/ipfs/" + image;
  //   }
  //   else{
  //     return image;
  //   }
  // }
  
  const imgsrc = useGetAssetImageSrc(asset);
  if(asset && !assetImgSrc && imgsrc){
    setAssetImgSrc(imgsrc);
  }

  return (
    <>
    {
      no_figure && assetImgSrc? (
        <img className={className} src={assetImgSrc} alt={asset.info.onchainMetadata.name} style={{width:width, height: width}}/>
      ) :
      setShow && assetImgSrc? (
        <figure className="image is-square" onClick={() => setShow(show_trigger?show_trigger:false)} style={{cursor:"pointer"}}>
          <img src={assetImgSrc} alt={asset.info.onchainMetadata.name} style={{width:width, height: width}}/>
        </figure>
      ) : assetImgSrc ? (
        <figure className="image is-square">
          <img src={assetImgSrc} alt={asset.info.onchainMetadata.name} style={{width:width, height: width}}/>
        </figure>
      ) : <></>
    }
    </>
  )
}

export default AssetImageFigure;
