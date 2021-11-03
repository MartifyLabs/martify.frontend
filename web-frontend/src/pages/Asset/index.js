import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

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

    if(policy_id in state_collection.policies_collections){
      var tmp = {...state_collection.policies_collections[policy_id]}
      tmp.style.logo_path = `/collections/${tmp.id}/${tmp.style.logo}`;
      setThisCollection(tmp);
    }

    if(policy_id in state_collection.policies_assets){
      if(asset_id in state_collection.policies_assets[policy_id]){
        setAsset(state_collection.policies_assets[policy_id][asset_id]);
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
                  
                  <AssetImage asset={asset}/>

                </div>

                <div className="column">
                  <div className="content">

                    <PriceBuy asset={asset} thisCollection={thisCollection} />

                    { asset_id in state_wallet.assets ? <OwnerList asset={asset} listToken={listToken} /> : <></> }

                    <AboutAsset thisCollection={thisCollection} asset={asset} />
                    
                    { thisCollection ? <CollectionAbout thisCollection={thisCollection} /> : <></> }
                    
                    <AssetRawMetaData asset={asset} />
                    
                  </div>
                </div>
                
              </div>
            </section>
          </div>
        ) : (
          <NoAssetFound state_collection={state_collection} policy_id={policy_id} asset_id={asset_id} />
        )
      }
    </>
    
  )
};

const PriceBuy = ({asset, thisCollection}) => {
  return (
    <div className="block">
      <nav className="level">

        <div className="level-left">
          <div className="level-item asset_name_block">
            <h1>{asset.info.onchainMetadata.name}</h1>
            {
              thisCollection ? (
                <Link to={`/collection/${thisCollection.id}`}>
                  {thisCollection.meta.name}
                </Link>
              ) : (
                <Link to={`/collection/${asset.info.policyId}`}>
                  {asset.info.policyId}
                </Link>
              )
            }
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
  
  function getArraysIntersection(a1,a2){
    return  a1.filter(function(n) { return a2.indexOf(n) !== -1;});
  }

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
                    thisCollection.asset_attributes ? 
                      getArraysIntersection(thisCollection.asset_attributes,Object.keys(asset.info.onchainMetadata)).length > 0 ? 
                        thisCollection.asset_attributes.map((attr, i) => {
                          return(
                            <ListAttributes asset={asset} attr={attr} key={i}/>
                          )
                        }) : <ListAllAttributes asset={asset}/> : <ListAllAttributes asset={asset}/>
                  }
                </>
              ) : (
                <ListAllAttributes asset={asset}/>
              )
            }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ListAttributes = ({asset, attr}) => {
  return (
    <tr>
      <th className="attr">{attr}</th>
      <td>
        {
          typeof(asset.info.onchainMetadata[attr])=="object" ? asset.info.onchainMetadata[attr].join(" ") : asset.info.onchainMetadata[attr]
        }
      </td>
    </tr>
  )
};

const ListAllAttributes = ({asset}) => {
  return (
    <>
      {
        Object.keys(asset.info.onchainMetadata)
        .filter((attr)=>{
          return !["files","image","name","mediatype"].includes(attr.toLowerCase())
        })
        .map((attr, i) => {
          return(
            <React.Fragment key={i}>
              <ListAttributes asset={asset} attr={attr} key={i}/>
            </React.Fragment>
          )
        })
      }
    </>
  )
};


const AssetRawMetaData = ({asset}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="card">
      <header className="card-header" onClick={() => setShow(!show)} style={{cursor:"pointer"}}>
        <p className="card-header-title">
          Raw Metadata
        </p>
        <button className="card-header-icon" aria-label="more options">
          <span className="icon">
            <i className={show ? "fas fa-angle-down" : "fas fa-angle-up"} aria-hidden="true"></i>
          </span>
        </button>
      </header>
      {
        show ? (
          <div className="card-content">
            <div className="content" style={{display:"grid"}}>
              <pre>
                {JSON.stringify(asset.info, null, 1) }
              </pre>
            </div>
          </div>
        ) : <></>
      }
    </div>
  )
}

const AssetImage = ({asset}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="block">
      <figure className="image is-square" onClick={() => setShow(true)} style={{cursor:"pointer"}}>
        <img src={"https://ipfs.blockfrost.dev/ipfs/"+asset.info.onchainMetadata.image} alt={asset.info.onchainMetadata.name}/>
      </figure>

      <div className={"modal "+(show?"is-active":"") }>
        <div className="modal-background" onClick={() => setShow(false)}></div>
        <div className="modal-content">
          {
            asset.info.onchainMetadata.files ? (
              <iframe src={asset.info.onchainMetadata.files[0].src.join("")} style={{width:"600px",height:"600px"}}>
                The “iframe” tag is not supported by your browser.
              </iframe>
            ) : (
              <figure className="image is-square" onClick={() => setShow(true)} style={{cursor:"pointer"}}>
                <img src={"https://ipfs.blockfrost.dev/ipfs/"+asset.info.onchainMetadata.image} alt={asset.info.onchainMetadata.name}/>
              </figure>
            )
          }
        </div>
        <button className="modal-close is-large" aria-label="close" onClick={() => setShow(false)}></button>
      </div>
       
    </div>
  )
}

const NoAssetFound = ({state_collection, policy_id, asset_id}) => {
  return (
    <section className="hero is-large">
      <div className="hero-body">
        <div className="container has-text-centered">
          {
            !state_collection.loading ? (
              <>
              {
                policy_id in state_collection.policies_assets ? (
                  <>
                  {
                    state_collection.policies_assets[policy_id][asset_id]===false ? <ShowNoAssetFound/> : ""
                  }
                  </>
                ) : <ShowNoAssetFound/>
              }
              </>
            ) : <></>
          }
          {
            state_collection.loading ? (
              <>
                <h1>
                  <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
                    <i className="fas fa-search"></i>
                  </span>
                </h1>
                <p className="title">
                  Getting asset meta
                </p>
                <p className="subtitle">
                  Fetching from da blockchain yea
                </p>
              </>
            ) : <></>
          }
        </div>
      </div>
    </section>
  )
}

const ShowNoAssetFound = () => {
  return (
    <>
      <h1>
        <span className="icon" style={{fontSize:"100px", marginBottom:"50px"}}>
          <i className="far fa-question-circle"></i>
        </span>
      </h1>
      <p className="title">
        This asset does not exist.
      </p>
      <p className="subtitle">
        If you believe this is a mistake, please report this error to our support team.
      </p>
    </>
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
