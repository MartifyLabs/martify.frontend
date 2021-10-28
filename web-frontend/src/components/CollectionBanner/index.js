import React from "react";
import { Link } from "react-router-dom";

const CollectionBanner = ({thisCollection, size}) => {
  return (
    <section className={"hero collection_name " + (size!=undefined ? size : "is-medium")} style={{backgroundImage: `url(${thisCollection.style.banner_path})`}}>
        <div className="hero-body">
        
          <nav className="level">
            <Link to={`/collection/${thisCollection.id}`}>
              <div className="level-left">
                {
                  thisCollection.style.logo_path ? (
                    <div className="level-item">
                      <figure className="image is-128x128">
                        <img className="collection_logo is-rounded image is-128x128" src={thisCollection.style.logo_path} />
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
                <div className="field has-addons social-links">
                {
                  Object.keys(thisCollection.links).map(function (key) {
                    var icon = "";
                    if(key=='discord')icon="fab fa-discord";
                    if(key=='twitter')icon="fab fa-twitter";
                    if(key=='website')icon="fas fa-laptop";
                    return (
                      <p className="control" key={key}>
                        <a className="button" href={thisCollection.links[key]} rel="noreferrer" target="_blank">
                          <span className="icon">
                            <i className={icon}></i>
                          </span>
                        </a>
                      </p>
                    )
                  })
                }
                </div>
              </div>
            </div>
          </nav>

        </div>
      </section>
  );
};

export default CollectionBanner;
