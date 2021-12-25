import Cardano from "../cardano/serialization-lib";

export const fromAscii = (hex) => Buffer.from(hex).toString("hex");

export const fromBech32 = (bech32) =>
  Cardano.Instance.BaseAddress.from_address(
    Cardano.Instance.Address.from_bech32(bech32)
  );

export const fromHex = (hex) => Buffer.from(hex, "hex");

export const toHex = (bytes) => Buffer.from(bytes).toString("hex");

export const fromLovelace = (lovelace) => lovelace / 1000000;

export const toLovelace = (ada) => ada * 1000000;

export const toString = (bytes) => String.fromCharCode.apply(String, bytes);

// handle images

export const convertMetadataPropToString = (src) => {
  if (typeof src === "string") return src;
  else if (Array.isArray(src)) return src.join("");
  return null;
};

export const linkToSrc = (link, base64 = false) => {
  let root = "https://infura-ipfs.io/ipfs";

  const base64regex =
    /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  if (link.startsWith("https://")) return link;
  else if (link.startsWith("ipfs://"))
    return root + "/" + link.split("ipfs://")[1].split("ipfs/").slice(-1)[0];
  else if (
    (link.startsWith("Qm") && link.length === 46) ||
    (link.startsWith("baf") && link.length === 59)
  ) {
    return root + "/" + link;
  } else if (base64 && base64regex.test(link))
    return "data:image/png;base64," + link;
  else if (link.startsWith("data:image")) return link;
  return null;
};

export const get_asset_image_source = (image) => {
  // let root = "https://ipfs.io/ipfs/";
  // let root = "https://infura-ipfs.io/ipfs/";

  // if(image){
  //   if(Array.isArray(image)){
  //     image = image.join("");
  //   }
  //   console.log(image)
  //   if(image.includes("ipfs://ipfs/")){
  //     return root + image.split("ipfs://ipfs/")[1];
  //   }
  //   else if(image.includes("ipfs://")){
  //     return root + image.split("ipfs://")[1];
  //   }
  //   else if(image.length==46){
  //     return root + image;
  //   }
  //   else{
  //     return image;
  //   }
  // }
  // return "";

  if (image) {
    return linkToSrc(convertMetadataPropToString(image));
  }
};

export const numFormatter = (num) => {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(1) + "K"; // convert to K for number from > 1000 < 1 million
  } else if (num > 1000000) {
    return (num / 1000000).toFixed(1) + "M"; // convert to M for number from > 1 million
  } else if (num < 900) {
    return num; // if value < 1000, nothing to do
  }
};
