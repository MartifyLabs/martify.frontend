import React from "react";
import { Link } from "react-router-dom";

const AboutCollection = ({thisCollection}) => {
  return (
    <>
    {
      thisCollection ? (
        <div className="block">
          <div className="card">
            <header className="card-header">
              <p className="card-header-title">
                <Link to={`/collection/${thisCollection.id}`}>
                  About {thisCollection.meta.name}
                </Link>
              </p>
            </header>
            <div className="card-content">
              <div className="content">
                {thisCollection.meta.description}
              </div>
            </div>
          </div>
        </div>
      ) : <></>
    }
    </>
  );
};

export default AboutCollection;
