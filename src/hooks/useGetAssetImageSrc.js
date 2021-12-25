import { useEffect, useState } from "react";

export const useGetAssetImageSrc = (asset) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (asset) {
      if (asset.details) {
        if (asset.details.onchainMetadata) {
          const imgSrc = getSrc(asset.details.onchainMetadata.image);
          setSrc(imgSrc);
        }
      }
    }
  }, [asset]);

  const getSrc = (image) => {
    if (Array.isArray(image)) {
      image = image.join("");
      return image;
    } else if (image.includes("ipfs://ipfs/")) {
      let i = "https://infura-ipfs.io/ipfs/" + image.split("ipfs://ipfs/")[1];
      return i;
    } else if (image.includes("ipfs://")) {
      let i = "https://infura-ipfs.io/ipfs/" + image.split("ipfs://")[1];
      return i;
    } else if (image.length === 46) {
      return "https://infura-ipfs.io/ipfs/" + image;
    } else {
      return image;
    }
  };

  return src;
};
