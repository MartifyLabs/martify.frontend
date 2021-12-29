import React from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';

const Image = ({src, alt}) => {
  return (
    <LazyLoadImage
      alt={alt ? alt : ""}
      src={src}
      effect="opacity"
      />
  );
};

export default Image;
