import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { load_collection, get_token} from "../../store/collection/api";
import ButtonBuy from "../../components/ButtonBuy";
import AboutCollection from "../../components/AboutCollection";
import CollectionBanner from "../../components/CollectionBanner";

import "./style.css";

const Asset = ({state_collection, policy_id, asset_id, get_token}) => {

  const [token, setToken] = useState(false);
  const [thisCollection, setThisCollection] = useState(false);

  useEffect(() => {
    let query_token = false;

    // get_token

    if(policy_id in state_collection.policies_tokens){
      if(asset_id in state_collection.policies_tokens[policy_id]){
        setToken(state_collection.policies_tokens[policy_id][asset_id]);

        if(policy_id in state_collection.policies_collections){

          var tmp = {...state_collection.collections[ state_collection.policies_collections[policy_id] ]}
          tmp.style.logo_path = `/collections/${tmp.id}/${tmp.style.logo}`;
          
          setThisCollection(tmp);
        }

      }else{
        query_token = true;
      }
    }else{
      query_token = true;
    }

    if(query_token && !state_collection.loading){
      get_token(policy_id, asset_id, (res) => {

      });
    }
  }, [policy_id, asset_id, state_collection]);

  return (
    <>
      {
        thisCollection ? <CollectionBanner thisCollection={thisCollection} size="is-small" /> : <></>
      }
      {
        token ? (
          <div className="container asset">
            <section className="section">
              <div className="columns">
                <div className="column is-two-fifths">
                  <div className="block">
                    <figure className="image is-square">
                      <img src={"https://ipfs.blockfrost.dev/ipfs/"+token.meta.image} alt={token.meta.name}/>
                    </figure>
                  </div>
                </div>
                <div className="column">
                  <div className="content">

                    <PriceBuy token={token} />

                    <AboutToken thisCollection={thisCollection} token={token} />

                    { thisCollection ? <AboutCollection thisCollection={thisCollection} /> : <></> }
                    
                  </div>
                </div>
                
              </div>
            </section>
          </div>
        ) : (
          <div>
            no token
          </div>
        )
      }
    </>
    
  )
};

const PriceBuy = ({token}) => {
  return (
    <div className="block">
      <nav className="level">

        <div className="level-left">
          <div className="level-item">
            <h1>{token.meta.name}</h1>
          </div>
        </div>

        <div className="level-right">
          <div className="level-item">
            <div className="media-content">
              <p className="title is-4">₳{token.price}</p>
              {/* <p className="subtitle is-6">Current price</p> */}
            </div>
          </div>
          <div className="level-item">
            <ButtonBuy />
          </div>
        </div>

      </nav>
    </div>
  )
}

const AboutToken = ({thisCollection, token}) => {
  return (
    <div className="block">
      <div className="card">
        <div className="card-content">
          <table className="table">
            <tbody>
            {
              thisCollection ? (
                <>
                  {
                    thisCollection.asset_attributes ? thisCollection.asset_attributes.map((attr, i) => {
                      return(
                        <tr key={i}>
                          <th className="attr">{attr}</th>
                          <td>
                            {
                              typeof(token.meta[attr])=="object" ? token.meta[attr].join(" ") : token.meta[attr]
                            }
                          </td>
                        </tr>
                      )
                    }) : ""
                  }
                </>
              ) : ""
            }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps(state, props) {
  return {
    policy_id: props.match.params.policy_id,
    asset_id: props.match.params.asset_id,
    state_collection: state.collection
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load_collection: (callback) => dispatch(load_collection(callback)),
    get_token: (policy_id, asset_id, callback) => dispatch(get_token(policy_id, asset_id, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Asset);
