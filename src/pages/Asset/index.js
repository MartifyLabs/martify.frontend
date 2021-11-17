import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Moment from 'react-moment';

import { urls } from "../../config";
import { load_collection, get_asset, asset_add_offer, opencnft_get_asset_tx } from "../../store/collection/api";
import { listToken, updateToken, delistToken, purchaseToken } from "../../store/market/api";
import { WALLET_STATE } from "../../store/wallet/walletTypes";

import CollectionAbout from "../../components/CollectionAbout";
import CollectionBanner from "../../components/CollectionBanner";
import AssetImageFigure from "../../components/AssetImageFigure";

import "./style.css";

const Asset = ({state_collection, state_wallet, policy_id, asset_id, get_asset, list_token, update_token, delist_token, purchase_token, asset_add_offer, opencnft_get_asset_tx}) => {

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
      get_asset(asset_id, (res) => {});
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
                  <Listing asset={asset} state_wallet={state_wallet} list_token={list_token} update_token={update_token} delist_token={delist_token} purchase_token={purchase_token} asset_add_offer={asset_add_offer} />
                </div>

                <div className="column">
                  <div className="content">

                    <AssetHeader asset={asset} thisCollection={thisCollection} />

                    <AboutAsset thisCollection={thisCollection} asset={asset} />

                    { thisCollection ? <CollectionAbout thisCollection={thisCollection} /> : <></> }

                    <Transactions asset={asset} opencnft_get_asset_tx={opencnft_get_asset_tx} />
                    
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

const Listing = ({asset, state_wallet, list_token, update_token, delist_token, purchase_token, asset_add_offer}) => {
  return (
    <div className="block">
      { asset.info.asset in state_wallet.assets ? 
        <OwnerListAsset state_wallet={state_wallet} asset={asset} list_token={list_token} update_token={update_token} delist_token={delist_token} /> : 
        <PurchaseAsset asset={asset} asset_add_offer={asset_add_offer} state_wallet={state_wallet} purchase_token={purchase_token} /> 
      }
    </div>
  )
}

const PurchaseAsset = ({asset, asset_add_offer, state_wallet, purchase_token}) => {

  const [showTab, setShowTab] = useState( asset.listing ? asset.listing.is_listed ? "buy" : "offer" : "offer");
  const [userInputAmount, setUserInputAmount] = useState("");
  const [showModal, setShowModal] = useState(false);

  function successful_transaction(res){
    setUserInputAmount("");
    if(res.success){
      setShowModal(res.type);
    }
  }

  function list_this_token(price){
    asset_add_offer(asset.info.asset, price, (res) => {
      successful_transaction(res);
    });
  }

  function purchase_this_token(){
    purchase_token(asset, (res) => {
      successful_transaction(res);
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

  useEffect(() => {
    if(showModal){
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

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
                <li className={showTab==="buy"?"is-active":""} onClick={() => setShowTab("buy")}><a>Buy Now</a></li>
                <li className={showTab==="offer"?"is-active":""} onClick={() => setShowTab("offer")}><a>Offer</a></li>
              </ul>
            </div>
          )
          : <></> : <></>
        }
        
        {
          showTab==="buy" ? asset.listing ? asset.listing.is_listed ? (
            <>
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
                  <ButtonBuy state_wallet={state_wallet} purchase_this_token={purchase_this_token} />
                </div>
              </nav>
              { state_wallet.connected ? state_wallet.data.collateral.length===0 ? 
                <p className="help">Fund the wallet and add collateral (option in Nami).</p> : <></> : <></>
              }
            </>
          )
          : <></> : <></> : <></>
        }

        {
          showTab==="offer" ? asset.offers ? Object.keys(asset.offers).length ? 
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
          showTab==="offer" ? (
            <div className="field has-addons">
              <div className="control has-icons-left is-expanded">
                <input className="input" type="number" placeholder="Offer price"
                value={userInputAmount} onChange={(event) => input_price_changed(event)} 
                disabled={state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE || !state_wallet.connected}
                />
                <span className="icon is-medium is-left">₳</span>
                { !state_wallet.connected ? 
                  <p className="help">Connect your wallet to offer</p> : <></>
                }
              </div>
              <div className="control">
                <button className="button is-info" onClick={() => list_this_token(userInputAmount)}
                disabled={state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE || userInputAmount < 5 || !state_wallet.connected}
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

      {
        showModal ? (
          <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
              <section className="modal-card-body has-text-centered">
                <span className="icon has-text-success" style={{fontSize:"100px", margin:"50px"}}>
                  <i className="far fa-check-circle"></i>
                </span>
                <p className="is-size-4">
                  {
                    showModal == "purchase-success" ? <span>Purchased <b>{asset.info.onchainMetadata.name}</b>!</span> : 
                    showModal == "offer-success" ? <span>You made an offer for <b>{asset.info.onchainMetadata.name}</b>!</span> : 
                    ""
                  }
                </p>
                <button className="button is-info is-outlined is-medium" onClick={() => setShowModal(false)}>
                  {
                    ["Yes!", "Yay!", "Ok!", "Nice!"][(Math.random() * 4) | 0]
                  }
                </button>
              </section>
            </div>
          </div>
        ) : <></>
      }

    </div>
  )
}

const ButtonBuy = ({state_wallet, purchase_this_token}) => {

  const [showNotification, setShowNotification] = useState(false);

  async function begin_buy_process() {
    purchase_this_token();
  }

  return (
    <>
      <button className={"button is-rounded is-info" + (state_wallet.loading ? " is-loading" : "")} 
        disabled={state_wallet.loading || !state_wallet.connected || state_wallet.data.collateral.length===0} 
        onClick={() => begin_buy_process()}>
        <span>Buy Now</span>
      </button>
      {
        showNotification ? (
          <div className="notification-window notification ">
            <button className="delete" onClick={() => setShowNotification(false)}></button>
            {
              showNotification ? (
                <>
                {
                  showNotification.type === "payment-success" ? (
                    <p>
                      Payment successful.<br/>
                      <a href={urls.cardanoscan+showNotification.data} target="_blank" rel="noreferrer">{showNotification.data}</a>.
                    </p>
                  ) : <></>
                }
                </> 
              ) : <></>
            }
          </div>
        ) : <></>
      }
    </>
  );
};

const OwnerListAsset = ({state_wallet, asset, list_token, update_token, delist_token}) => {

  const [userInputAmount, setUserInputAmount] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function successful_transaction(res){
    setUserInputAmount("");
    if(res.success){
      setShowModal(res.type);
    }
  }
  function list_this_token(price){
    list_token(asset, price, (res) => {
      successful_transaction(res);
    });
  }

  function update_this_listing(price){
    console.log("update listing ", price)
    update_token(asset, price, (res) => {
      successful_transaction(res);
    });
  }

  function delist_this_token(){
    delist_token(asset, (res) => {
      successful_transaction(res);
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

  useEffect(() => {
    if(state_wallet.loading){
      if(state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE){
        setShowNotification("Awaiting signature...");
      }
    }else{
      setShowNotification(false);
    }
  }, [state_wallet]);

  useEffect(() => {
    if(showModal){
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">
          List {asset.info.onchainMetadata.name} for sale in the Marketplace
        </p>
      </header>
      <div className="card-content">
        {
          asset.offers ? Object.keys(asset.offers).length ? 
          (
            <nav className="level is-mobile">
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
            </nav>
          )
          : <></> : <></>
        }
        {
          asset.listing ? asset.listing.is_listed ? (
            <nav className="level is-mobile">
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
                <button className={"button is-rounded is-info" + (state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE ? " is-loading" : "")} 
                  disabled={state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE} onClick={() => delist_this_token()}>
                  <span>Cancel listing</span>
                </button>
              </div>
            </nav>
          )
          : <></> : <></>
        }
        
        <div className="field has-addons">
          <div className="control has-icons-left is-expanded">
            <input className="input" type="number" placeholder={asset.listing.is_listed ? "Update listing price" : "Input listing price"}
            value={userInputAmount} onChange={(event) => input_price_changed(event)} 
            disabled={state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE}
            />
            <span className="icon is-medium is-left">₳</span>
            { state_wallet.data.collateral.length===0 ? 
              <p className="help">Fund the wallet and add collateral (option in Nami).</p> : <></>
            }
          </div>
          <div className="control">
            <button className={"button is-info " + (state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE?"is-loading":"")}
              onClick={() => asset.listing.is_listed ? update_this_listing(userInputAmount) : list_this_token(userInputAmount)}
              disabled={state_wallet.loading==WALLET_STATE.AWAITING_SIGNATURE || userInputAmount < 5}
            >
              {
                userInputAmount ? `List for ₳${userInputAmount}!` : "List this!"
              }
            </button>
          </div>
        </div>

      </div>

      {
        showNotification ? (
          <div className="notification-window notification is-info">
            <button className="delete" onClick={() => setShowNotification(false)}></button>
            <p>
              {showNotification}
            </p>
          </div>
        ) : <></>
      }

      {
        showModal ? (
          <div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-card">
              <section className="modal-card-body has-text-centered">
                <span className="icon has-text-success" style={{fontSize:"100px", margin:"50px"}}>
                  <i className="far fa-check-circle"></i>
                </span>
                <p className="is-size-4">
                  {
                    showModal == "list-success" ? <span>Listed <b>{asset.info.onchainMetadata.name}</b> successfully!</span> : 
                    showModal == "price-update-success" ? <span>Listing price for <b>{asset.info.onchainMetadata.name}</b> updated!</span> : 
                    showModal == "delist-success" ? <span><b>{asset.info.onchainMetadata.name}</b> removed from the marketplace.</span> : 
                    ""
                  }
                </p>
                <button className="button is-info is-outlined is-medium" onClick={() => setShowModal(false)}>
                  {
                    ["Yes!", "Yay!", "Ok!", "Nice!"][(Math.random() * 4) | 0]
                  }
                </button>
              </section>
            </div>
          </div>
        ) : <></>
      }

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
                asset.info.onchainMetadata.files[0].mediaType==="text/html" ? (
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

const Transactions = ({asset, opencnft_get_asset_tx}) => {

  const [firstLoad, setFirstLoad] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [transactions, setTransactions] = useState(false);

  function feteh_update(){
    setFetching(true);
    setTransactions(false);
    
    opencnft_get_asset_tx(asset.info.asset, (res) => {
      setFirstLoad(true);

      if(res.data.statusCode === 404){
        setTransactions([]);
      }else{
        setTransactions(res.data.items);
      }
      setFetching(false);
    });
  }
  
  return (
    <div className="block">
      <div className="card">
        <header className="card-header">
          <p className="card-header-title">
            Transactions
          </p>
          <button className="card-header-icon" aria-label="more options" onClick={() => feteh_update()}>
            <span className="icon">  
              <i className={"fas fa-sync " + (fetching?"icn-spinner":"")}></i>
            </span>
          </button>
        </header>
        {
          firstLoad ? (
            <div className="card-content">
              {
                transactions ? transactions.length>0 ? (
                  <table className="table">
                    <tbody>
                      {
                        transactions.map((tx, i) => {
                          return (
                            <tr>
                              <td>
                                <Moment format="MMM DD YYYY">
                                  {tx.sold_at}
                                </Moment>
                              </td>
                              <td>₳{tx.price/1000000}</td>
                              <td>{tx.marketplace}</td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                ) : <div>No transactions found on marketplaces.</div>
                : <></>
              }
            </div>
          ) : <></>
        }
      </div>
    </div>
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
    get_asset: (asset_id, callback) => dispatch(get_asset(asset_id, callback)),
    list_token: (asset, price, callback) => dispatch(listToken(asset, price, callback)),
    update_token: (asset, price, callback) => dispatch(updateToken(asset, price, callback)),
    delist_token: (asset, callback) => dispatch(delistToken(asset, callback)),
    purchase_token: (asset, callback) => dispatch(purchaseToken(asset, callback)),
    asset_add_offer: (asset_id, price, callback) => dispatch(asset_add_offer(asset_id, price, callback)),
    opencnft_get_asset_tx: (asset_id, callback) => dispatch(opencnft_get_asset_tx(asset_id, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Asset);
