export const fromAscii = (hex) => Buffer.from(hex).toString("hex");

export const fromHex = (hex) => Buffer.from(hex, "hex");

export const toHex = (bytes) => Buffer.from(bytes).toString("hex");

export const toString = (bytes) => String.fromCharCode.apply(String, bytes);


export const get_asset_image_source = (image) => {
  // let root = "https://ipfs.io/ipfs/";
  let root = "https://infura-ipfs.io/ipfs/";

  if(Array.isArray(image)){
    image = image.join("");
    return image;
  }
  else if(image.includes("ipfs://ipfs/")){
    return root + image.split("ipfs://ipfs/")[1];
  }
  else if(image.includes("ipfs://")){
    return root + image.split("ipfs://")[1];
  }
  else if(image.length==46){
    return root + image;
  }
  else{
    return image;
  }
};


export const numFormatter = (num) => {
  if(num > 999 && num < 1000000){
      return (num/1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million 
  }else if(num > 1000000){
      return (num/1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million 
  }else if(num < 900){
      return num; // if value < 1000, nothing to do
  }
}