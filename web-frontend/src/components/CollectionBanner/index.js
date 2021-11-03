import React from "react";
import { Link } from "react-router-dom";
import CollectionLinks from "../CollectionLinks";

const CollectionBanner = ({thisCollection, size}) => {
  console.log(thisCollection)
  return (
    <section className={"hero collection_name " + (size!=undefined ? size : "is-medium")} style={{backgroundImage: `url(${thisCollection.style.banner_path})`}}>
        <div className="hero-body">
        
          <nav className="level">
            <Link to={`/collection/${thisCollection.id?thisCollection.id:thisCollection.meta.name}`}>
              <div className="level-left">
                {
                  thisCollection.style.logo_path ? (
                    <div className="level-item">
                      <figure className="image is-128x128">
                        <img className="collection_logo is-rounded image is-128x128" src={thisCollection.style.logo_path} alt="" />
                      </figure>
                    </div>
                  ) : <></>
                }
                <div className="level-item">
                  <div className="collection_title">
                    <p className="title is-size-1" style={{color: thisCollection.style.font_color_title}}>
                      {thisCollection.meta.name}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="level-right">
              <div className="level-item">
                <CollectionLinks collection={thisCollection} />
              </div>
            </div>
          </nav>

        </div>
      </section>
  );
};

export default CollectionBanner;
