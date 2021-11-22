import React from "react";

export default function useGetAssetImageSrc(asset) {

  function get_src(image){
    if(Array.isArray(image)){
      image = image.join("");
      return image;
    }
    else if(image.includes("ipfs://ipfs/")){
      var i = "https://infura-ipfs.io/ipfs/" + image.split("ipfs://ipfs/")[1];
      return i;
    }
    else if(image.includes("ipfs://")){
      var i = "https://infura-ipfs.io/ipfs/" + image.split("ipfs://")[1];
      return i;
    }
    else if(image.length===46){
      return "https://infura-ipfs.io/ipfs/" + image;
    }
    else{
      return image;
    }
  }

  const [src, setSrc] = React.useState(false);

  React.useEffect(() => {
    if(asset){      
      if(asset.details){
        if(asset.details.onchainMetadata){
          const img_src = get_src(asset.details.onchainMetadata.image)
          setSrc(img_src);
          
        }
      }
    }
    
  }, []);

  return src;

}
