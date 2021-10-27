import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

const Card = ({token}) => {  
  return (
    <Link to={`/assets/${token.policy_id}/${token.token_id}`}>
      <div className="card">
        <div className="card-image">
          <figure className="image is-square">
            <img src={"https://ipfs.blockfrost.dev/ipfs/"+token.meta.image} alt={token.meta.name}/>
          </figure>
        </div>
        <div className="card-content">
          <div className="media">
            <div className="media-content">
              <p className="title is-4">{token.meta.name}</p>
              <p className="subtitle is-6">₳{token.price}</p>
            </div>
          </div>
  {/* 
          <div className="content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Phasellus nec iaculis mauris. <a>@bulmaio</a>.
            <a href="#">#css</a> <a href="#">#responsive</a>
          </div> */}
        </div>
      </div>
    </Link>
  )
};

export default Card;
