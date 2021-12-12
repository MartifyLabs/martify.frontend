import React from "react";
import { urls } from "../../config";

const CollectionLinks = ({collection}) => {

  const links = {
    discord: {
      icon: "fab fa-discord",
      tooltip: "Join the Discord"
    },
    twitter: {
      icon: "fab fa-twitter",
      tooltip: "Connect on Twitter"
    },
    website: {
      icon: "fas fa-laptop",
      tooltip: "Visit the website"
    },
  }

  return (
    <div className="field has-addons social-links">
      {
        collection ? collection.links ? 
        Object.keys(collection.links).map(function (key) {
          return (
            <p className="control" key={key}>
              <a className="button" href={collection.links[key]} rel="noreferrer" target="_blank" data-tooltip={links[key].tooltip}>
                <span className="icon">
                  <i className={links[key].icon}></i>
                </span>
              </a>
            </p>
          )
        }) : <></> : <></>
      }
    </div>
  );
};

export default CollectionLinks;
