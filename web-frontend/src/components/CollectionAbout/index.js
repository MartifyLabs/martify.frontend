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
                <p>{thisCollection.meta.description}</p>
                Policy ID:
                <pre>
                  {thisCollection.policy_id}
                </pre>
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
