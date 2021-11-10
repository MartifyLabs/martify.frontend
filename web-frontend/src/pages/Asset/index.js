import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { urls } from "../../config";
import { load_collection, get_asset, asset_add_offer, get_asset_transactions } from "../../store/collection/api";
import { listToken } from "../../store/market/api";

import ButtonBuy from "../../components/ButtonBuy";
import CollectionAbout from "../../components/CollectionAbout";
import CollectionBanner from "../../components/CollectionBanner";
import AssetImageFigure from "../../components/AssetImageFigure";

import "./style.css";

const Asset = ({state_collection, state_wallet, policy_id, asset_id, get_asset, listToken, asset_add_offer, get_asset_transactions}) => {

  const [asset, setAsset] = useState(false);
  const [thisCollection, setThisCollection] = useState(false);
  
  useEffect(() => {
    let query_asset = false;

    if(policy_id in state_collection.policies_collections){
      var tmp = {...state_collection.policies_collections[policy_id]}
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
        thisCollection && asset ? <CollectionBanner thisCollection={thisCollection} size="is-small" asset={asset} /> : <></>
      }
      {
        asset ? (
          <div className="container asset">
            <section className="section">
              <div className="columns">
                <div className="column is-two-fifths">
                  <AssetImage asset={asset}/>
                  <Listing asset={asset} state_wallet={state_wallet} listToken={listToken} asset_add_offer={asset_add_offer} />
                </div>

                <div className="column">
                  <div className="content">

                    <AssetHeader asset={asset} thisCollection={thisCollection} />

                    <AboutAsset thisCollection={thisCollection} asset={asset} />

                    { thisCollection ? <CollectionAbout thisCollection={thisCollection} /> : <></> }

                    {/* <Transactions asset={asset} get_asset_transactions={get_asset_transactions} /> */}
                    
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

const AssetHeader = ({asset, thisCollection}) => {
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
            {
              thisCollection.is_martify_verified ? (
                <span className="icon" data-tooltip="Martify Verified">
                  <i className="fas fa-check-circle" style={{color:"gold"}}></i>
                </span>
              ) : thisCollection.is_cnft_verified ? (
                <span className="icon" data-tooltip="CNFT Verified">
                  <i className="fas fa-check-circle" style={{color:"green"}}></i>
                </span>
              ) : <></>
            }
          </div>
        </div>

        <div className="level-right">
          <div className="level-item">
            <SocialLinks asset={asset}/>
          </div>
        </div>

      </nav>
    </div>
  )
}

const SocialLinks = ({asset}) => {
  return (
    <div className="field has-addons social-links">
      <p className="control">
        <a className="button is-small social-icon" href={`https://twitter.com/share?url=${urls.root}assets/${asset.info.policyId}/${asset.info.asset}`} rel="noreferrer" target="_blank" data-tooltip="Share on Twitter">
          <span className="icon">
            <img src="/images/icons/twitter.svg"/>
          </span>
        </a>
      </p>
      <p className="control">
        <a className="button is-small social-icon" href={`https://www.facebook.com/sharer/sharer.php?u=${urls.root}assets/${asset.info.policyId}/${asset.info.asset}`} rel="noreferrer" target="_blank"  data-tooltip="Share on Facebook">
          <span className="icon">
            <img src="/images/icons/facebook.svg"/>
          </span>
        </a>
      </p>
      <p className="control">
        <a className="button is-small social-icon" href={`${urls.cardanoscan}token/${asset.info.asset}`} rel="noreferrer" target="_blank"  data-tooltip="Check Cardanoscan">
          <span className="icon">
            <img src="/images/icons/cardanoscan.png"/>
          </span>
        </a>
      </p>
      <p className="control">
        <a className="button is-small social-icon" href={`https://pool.pm/${asset.info.policyId}.${asset.info.readableAssetName}`} rel="noreferrer" target="_blank" data-tooltip="View it on pool.pm">
          <span className="icon">
            <img src="/images/icons/poolpm.png"/>
          </span>
        </a>
      </p>
    </div>
  );
};

const Listing = ({asset, state_wallet, listToken, asset_add_offer}) => {
  return (
    <div className="block">
      { asset.info.asset in state_wallet.assets ? 
        <OwnerListAsset state_wallet={state_wallet} asset={asset} listToken={listToken} /> : 
        <PurchaseAsset asset={asset} asset_add_offer={asset_add_offer} state_wallet={state_wallet} /> 
      }
    </div>
  )
}

const PurchaseAsset = ({asset, asset_add_offer, state_wallet}) => {

  const [showTab, setShowTab] = useState( asset.listing ? asset.listing.is_listed ? "buy" : "offer" : "offer");
  const [userInputAmount, setUserInputAmount] = useState("");
  const [sendingBid, setSendingBid] = useState(false);

  function list_this_token(price){
    setSendingBid(true);
    asset_add_offer(asset.info.asset, price, (res) => {
      setSendingBid(false);
      setUserInputAmount("");
    });
  }

  function input_price_changed(event){
    let v = event.target.value;
    if(v){
      v = parseInt(v)
      if(v){
        setUserInputAmount(v);
      }
    }else{
      setUserInputAmount("");
    }
  }

  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">
          Buy {asset.info.onchainMetadata.name}
        </p>
      </header>
      <div className="card-content">
        
        {
          asset.listing ? asset.listing.is_listed ? (
            <div className="tabs is-centered">
              <ul>
                <li className={showTab=="buy"?"is-active":""} onClick={() => setShowTab("buy")}><a>Buy Now</a></li>
                <li className={showTab=="offer"?"is-active":""} onClick={() => setShowTab("offer")}><a>Offer</a></li>
              </ul>
            </div>
          )
          : <></> : <></>
        }
        
        {
          showTab=="buy" ? asset.listing ? asset.listing.is_listed ? (
            <nav className="level is-mobile">
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Buy now</p>
                  <p className="title">
                    {asset.listing.price}
                    <span className="ada_symbol">₳</span>
                  </p>
                </div>
              </div>
                <div className="level-item has-text-centered">
                  <ButtonBuy />
                </div>
            </nav>
          )
          : <></> : <></> : <></>
        }

        {
          showTab=="offer" ? asset.offers ? Object.keys(asset.offers).length ? 
          (
            <nav className="level is-mobile">
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Current offer</p>
                  <p className="title">
                    {
                      Math.max.apply(Math, Object.keys(asset.offers).map(function(key){
                        return asset.offers[key];
                      }).map(function(o) { return o.p; }))
                    }
                    <span className="ada_symbol">₳</span>
                  </p>
                </div>
              </div>
              {
                state_wallet.connected ? state_wallet.data.wallet_address in asset.offers ? (
                  <div className="level-item has-text-centered">
                    <div>
                      <p className="heading">Your offer</p>
                      <p className="title">
                        {asset.offers[state_wallet.data.wallet_address].p}
                        <span className="ada_symbol">₳</span>
                      </p>
                    </div>
                  </div>
                ) : <></> : <></>
              }
            </nav>
          )
          : <></> : <></> : <></>
        }

        {
          showTab=="offer" ? (
            <div className="field has-addons">
              <div className="control has-icons-left is-expanded">
                <input className="input" type="number" placeholder="Offer price"
                value={userInputAmount} onChange={(event) => input_price_changed(event)} 
                disabled={sendingBid || !state_wallet.connected}
                />
                <span className="icon is-medium is-left">₳</span>
                { !state_wallet.connected ? 
                  <p className="help">Connect your wallet to offer</p> : <></>
                }
              </div>
              <div className="control">
                <button className="button is-info" onClick={() => list_this_token(userInputAmount)}
                disabled={sendingBid || userInputAmount < 5 || !state_wallet.connected}
                >
                  {
                    userInputAmount ? `Offer for ₳${userInputAmount}` : "Offer a price"
                  }
                </button>
              </div>
            </div>
          ) : <></>
        }

      </div>
    </div>
  )
}

const OwnerListAsset = ({state_wallet, asset, listToken}) => {

  const [userInputAmount, setUserInputAmount] = useState("");
  const [sendingBid, setSendingBid] = useState(false);

  function list_this_token(price){
    setSendingBid(true);
    listToken(asset, price, (res) => {
      setSendingBid(false);
      setUserInputAmount("");
    });
  }

  function input_price_changed(event){
    let v = event.target.value;
    if(v){
      v = parseInt(v)
      if(v){
        setUserInputAmount(v);
      }
    }else{
      setUserInputAmount("");
    }
  }

  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">
          List {asset.info.onchainMetadata.name} for sale in the Marketplace
        </p>
      </header>
      <div className="card-content">

        <nav className="level is-mobile">
          {
            asset.offers ? Object.keys(asset.offers).length ? 
            (
              <>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Highest offer</p>
                    <p className="title">
                      {
                        Math.max.apply(Math, Object.keys(asset.offers).map(function(key){
                          return asset.offers[key];
                        }).map(function(o) { return o.p; }))
                      }
                      <span className="ada_symbol">₳</span>
                    </p>
                  </div>
                </div>
              </>
            )
            : <></> : <></>
          }

          {
            asset.listing ? asset.listing.is_listed ? (
              <>
                <div className="level-item has-text-centered">
                  <div>
                    <p className="heading">Currently listed for</p>
                    <p className="title">
                      {asset.listing.price}
                      <span className="ada_symbol">₳</span>
                    </p>
                  </div>
                </div>
                <div className="level-item has-text-centered">
                  <button className={"button is-rounded is-info" + (sendingBid ? " is-loading" : "")} disabled={sendingBid} onClick={() => list_this_token(0)}>
                    <span>Cancel listing</span>
                  </button>
                </div>
              </>
            )
            : <></> : <></>
          }
        </nav>
        
        <div className="field has-addons">
          <div className="control has-icons-left is-expanded">
            <input className="input" type="number" placeholder={asset.listing.is_listed ? "Update listing price" : "Input listing price"}
            value={userInputAmount} onChange={(event) => input_price_changed(event)} 
            disabled={sendingBid}
            />
            <span className="icon is-medium is-left">₳</span>
            { state_wallet.data.collateral.length==0 ? 
              <p className="help">Fund the wallet and add collateral (option in Nami).</p> : <></>
            }
          </div>
          <div className="control">
            <button className="button is-info" onClick={() => list_this_token(userInputAmount)}
            disabled={sendingBid || userInputAmount < 5}
            >
              {
                userInputAmount ? `List for ₳${userInputAmount}!` : "List this!"
              }
            </button>
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
              <tr>
                <th className="attr">Policy ID</th>
                <td>
                  <nav className="level" style={{"marginBottom":"0px"}}>
                    <div className="level-left">
                      <div className="level-item">
                        <pre>{asset.info.policyId}</pre>
                      </div>
                    </div>
                    <div className="level-right">
                      <div className="level-item">
                        <a className="button social-icon" href={`${urls.cardanoscan}tokenPolicy/${asset.info.policyId}`} rel="noreferrer" target="_blank" data-tooltip="Check Cardanoscan" style={{marginLeft:"10px"}}>
                          <span className="icon">
                            <img src="/images/icons/cardanoscan.png"/>
                          </span>
                        </a>
                      </div>
                    </div>
                  </nav>
                  {
                    thisCollection.is_martify_verified ? <span className="is-size-7">This policy ID is verified by Martify.</span> : 
                    thisCollection.is_cnft_verified ? <span className="is-size-7">This policy ID is verified on CNFT.</span> : 
                    <></>
                  }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ListAttributes = ({asset, attr}) => {
  return (
    <>
    {
      attr in asset.info.onchainMetadata ? (
        <tr>
          <th className="attr">{attr}</th>
          <td>
            {
              typeof(asset.info.onchainMetadata[attr])=="object" ? (
                <table className="table is-narrow">
                  <tbody>
                  {
                    asset.info.onchainMetadata[attr]
                    .map((att, i) => {
                      return(
                        <tr key={i}><td>{att}</td></tr>
                      )
                    }
                  )}
                  </tbody>
                </table> 
              ) : asset.info.onchainMetadata[attr]
            }
          </td>
        </tr>
      ) : <></>
    }
    </>
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
      <AssetImageFigure asset={asset} setShow={setShow} show_trigger={true}/>

      <div className={"modal "+(show?"is-active":"") }>
        <div className="modal-background" onClick={() => setShow(false)}></div>
        <div className="modal-content">
          {
            asset.info.onchainMetadata.files ? (
              <>
              {
                asset.info.onchainMetadata.files[0].mediaType=="text/html" ? (
                  <iframe src={asset.info.onchainMetadata.files[0].src.join("")} style={{width:"600px",height:"600px"}}>
                    <AssetImageFigure asset={asset} setShow={setShow}/>
                  </iframe>
                ) : (
                  <AssetImageFigure asset={asset} setShow={setShow}/>
                )
              }
              </>
            ) : (
              <AssetImageFigure asset={asset} setShow={setShow}/>
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


// const Transactions = ({asset, get_asset_transactions}) => {

//   const [fetching, setFetching] = useState(false);

//   function feteh_update(){
//     setFetching(true);
    
//     get_asset_transactions(asset, (res) => {
//       setFetching(false);
//     });
//   }
  
//   return (
//     <div className="block">
//       <div className="card">
//       <header className="card-header">
//         <p className="card-header-title">
//           Transactions
//         </p>
//         <button className="card-header-icon" aria-label="more options" onClick={() => feteh_update()}>
//           <span className="icon">  
//             <i class={"fas fa-sync " + (fetching?"icn-spinner":"")}></i>
//           </span>
//         </button>
//       </header>
//         <div className="card-content">
//           <table className="table">
//             <tbody>
              
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

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
    listToken: (asset, price, callback) => dispatch(listToken(asset, price, callback)),
    asset_add_offer: (asset_id, price, callback) => dispatch(asset_add_offer(asset_id, price, callback)),
    get_asset_transactions: (asset, callback) => dispatch(get_asset_transactions(asset, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Asset);
