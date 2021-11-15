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
                {
                  thisCollection.is_martify_verified ? (
                    <span className="icon" data-tooltip="Martify Verified">
                      <i className="fas fa-check-circle" style={{color:"gold"}}></i>
                    </span>
                  ) : <></>
                }
                {
                  thisCollection.is_cnft_verified ? (
                    <span className="icon" data-tooltip="CNFT Verified">
                      <i className="fas fa-check-circle" style={{color:"green"}}></i>
                    </span>
                  ) : <></>
                }
              </p>
            </header>
            <div className="card-content">
              <div className="content">
                <p>{thisCollection.meta.description}</p>
                {
                  thisCollection.policy_ids ? (
                    <>
                      Policy ID:
                      <pre>
                        {thisCollection.policy_ids.join("\n")}
                      </pre>
                    </>
                  ) : <></>
                }
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
