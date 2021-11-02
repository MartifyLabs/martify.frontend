import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { load_collection, get_asset} from "../../store/collection/api";
import { listToken } from "../../store/market/api";

import ButtonBuy from "../../components/ButtonBuy";
import CollectionAbout from "../../components/CollectionAbout";
import CollectionBanner from "../../components/CollectionBanner";

import "./style.css";

const Asset = ({state_collection, state_wallet, policy_id, asset_id, get_asset, listToken}) => {

  const [asset, setAsset] = useState(false);
  const [thisCollection, setThisCollection] = useState(false);
  
  useEffect(() => {
    let query_asset = false;

    if(policy_id in state_collection.policies_assets){
      if(asset_id in state_collection.policies_assets[policy_id]){
        setAsset(state_collection.policies_assets[policy_id][asset_id]);

        if(policy_id in state_collection.policies_collections){
          var tmp = {...state_collection.policies_collections[policy_id]}
          tmp.style.logo_path = `/collections/${tmp.id}/${tmp.style.logo}`;
          setThisCollection(tmp);
        }

      }else{
        query_asset = true;
      }
    }else{
      query_asset = true;
    }

    if(query_asset && !state_collection.loading){
      get_asset(policy_id, asset_id, (res) => {});
    }
  }, [policy_id, asset_id, state_collection]);

  return (
    <>
      {
        thisCollection ? <CollectionBanner thisCollection={thisCollection} size="is-small" /> : <></>
      }
      {
        asset ? (
          <div className="container asset">
            <section className="section">
              <div className="columns">
                <div className="column is-two-fifths">
                  <div className="block">
                    <figure className="image is-square">
                      <img src={"https://ipfs.blockfrost.dev/ipfs/"+asset.info.onchainMetadata.image} alt={asset.info.onchainMetadata.name}/>
                    </figure>
                  </div>
                </div>

                <div className="column">
                  <div className="content">

                    <PriceBuy asset={asset} />

                    { asset_id in state_wallet.assets ? <OwnerList asset={asset} listToken={listToken} /> : <></> }

                    <AboutAsset thisCollection={thisCollection} asset={asset} />
                    
                    { thisCollection ? <CollectionAbout thisCollection={thisCollection} /> : <></> }
                    
                  </div>
                </div>
                
              </div>
            </section>
          </div>
        ) : (
          <div>
            no asset
          </div>
        )
      }
    </>
    
  )
};

const PriceBuy = ({asset}) => {
  return (
    <div className="block">
      <nav className="level">

        <div className="level-left">
          <div className="level-item">
            <h1>{asset.info.onchainMetadata.name}</h1>
          </div>
        </div>

        {
          asset.listing.is_listed ? (
            <div className="level-right">
              <div className="level-item">
                <div className="media-content">
                  <p className="title is-4">{asset.listing.price}<span className="ada_symbol">₳</span></p>
                </div>
              </div>
              <div className="level-item">
                <ButtonBuy />
              </div>
            </div>
          ) : <></>
        }
      </nav>
    </div>
  )
}

const OwnerList = ({asset, listToken}) => {

  const [userBidAmount, setUserBidAmount] = useState("");
  const [sendingBid, setSendingBid] = useState(false);

  function list_this_token(price){
    setSendingBid(true);
    let policy_id = asset.info.policyId;
    let assetName = asset.info.assetName;
    listToken(policy_id, assetName, price, (res) => {
      setSendingBid(false);
    });
  }

  function input_price_changed(event){
    let v = event.target.value;
    if(v){
      v = parseInt(v)
      if(v){
        setUserBidAmount(v);
      }
    }else{
      setUserBidAmount("");
    }
  }

  return (
    <div className="block">
      <div className="card">
        <header className="card-header">
          <p className="card-header-title">
            Listing asset for sale in the Marketplace
          </p>
        </header>
        <div className="card-content">
          
          <div className="field has-addons">
            <div className="control has-icons-left is-expanded">
              <input className="input" type="number" placeholder="Price"
              value={userBidAmount} onChange={(event) => input_price_changed(event)} 
              disabled={sendingBid}
              />
              <span className="icon is-medium is-left">₳</span>
            </div>
            <div className="control">
              <button className="button is-info" onClick={() => list_this_token(userBidAmount)}
              disabled={sendingBid || userBidAmount < 5}
              >
                List this!
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

const AboutAsset = ({thisCollection, asset}) => {
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
                              typeof(asset.info.onchainMetadata[attr])=="object" ? asset.info.onchainMetadata[attr].join(" ") : asset.info.onchainMetadata[attr]
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
    state_collection: state.collection,
    state_wallet: state.wallet,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    load_collection: (callback) => dispatch(load_collection(callback)),
    get_asset: (policy_id, asset_id, callback) => dispatch(get_asset(policy_id, asset_id, callback)),
    listToken: (policy_id, asset_id, price, callback) => dispatch(listToken(policy_id, asset_id, price, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Asset);
