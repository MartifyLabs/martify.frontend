import React from "react";
import CollectionLinks from "../CollectionLinks";

const CollectionAbout = ({thisCollection}) => {
  return (
    <>
    {
      thisCollection ? (
        <div className="block">
          <div className="card">
            <header className="card-header">
              <p className="card-header-title">
                About {thisCollection.meta.name}
              </p>
            </header>
            <div className="card-content">
              <div className="content">
                {thisCollection.meta.description}
              </div>
              <CollectionLinks collection={thisCollection} />
            </div>
          </div>
        </div>
      ) : <></>
    }
    </>
  );
};

export default CollectionAbout;
