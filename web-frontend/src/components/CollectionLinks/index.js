import React from "react";

const CollectionLinks = ({collection}) => {
  return (
    <div className="field has-addons social-links">
      {
        Object.keys(collection.links).map(function (key) {
          var icon = "";
          if(key=='discord')icon="fab fa-discord";
          if(key=='twitter')icon="fab fa-twitter";
          if(key=='website')icon="fas fa-laptop";
          return (
            <p className="control" key={key}>
              <a className="button" href={collection.links[key]} rel="noreferrer" target="_blank">
                <span className="icon">
                  <i className={icon}></i>
                </span>
              </a>
            </p>
          )
        })
      }
    </div>
  );
};

export default CollectionLinks;
