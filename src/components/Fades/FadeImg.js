import React, { useState } from "react";
import "./style.css";

const FadeImg = (props) => {
  const [show, setShow] = useState(false);

  const onLoad = () => {
    setShow(true);
  };

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      style={{
        opacity: 0,
        animation: show ? `fadeIn 0.5s ease-out forwards` : "",
      }}
      {...props}
      onLoad={onLoad}
    />
  );
};

export default FadeImg;
