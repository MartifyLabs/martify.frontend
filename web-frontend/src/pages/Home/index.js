import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import "./style.scss";

import Search from "../../components/Navbar/Search";
import {get_random_assets, get_top_projects} from "../../store/collection/api";
import { get_asset_image_source, numFormatter } from "../../utils";

const Home = ({state_collection, get_random_assets, get_top_projects}) => {
  
  const [listProjects, setListProjects] = useState([]);

  return (
    <div className="homepage">
      <Splash listProjects={listProjects} />
      <TopProjects get_top_projects={get_top_projects} listProjects={listProjects} setListProjects={setListProjects} />
    </div>
  );
};

const Splash = ({listProjects}) => {
  return (
    <>
      <div className="homepage_gallery">
        <div className="overlay"></div>
        <div className="columns is-multiline is-gapless">
        {
          listProjects.slice(0, 18).map((project, i) => {
            return(
              <div className="column is-one-fifth-desktop is-full-mobile is-4-tablet" key={i}>
                <div className="card">
                  <div className="card-image">
                    <figure className="image is-square">
                      <img src={project.image} />
                    </figure>
                  </div>
                </div>
              </div>
            )
          })
        }
        </div>
      </div>

      <section className="hero is-fullheight-with-navbar">
        <div className="hero-body">
          <div className="container">
            <div className="columns is-mobile is-multiline">
              <div className="column is-half is-offset-one-quarter">
                <img src="/images/martify-logo-white-yellow.png"/>
              </div>
              <div className="column is-full has-text-centered">
                <p className="is-size-1 slogan" style={{color:"#fff", lineHeight:"1"}}>Your new CNFT marketplace.</p>
                <p className="is-size-5" style={{color:"#fff"}}>Easiest way to buy and sell Cardano NFTs powered by smart contracts.</p>
              </div>
              <div className="column is-half is-offset-one-quarter">
                <Search size="is-large" placeholder="Search NFTs by collection name or policy ID" />
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  )
}

const TopProjects = ({get_top_projects, listProjects, setListProjects}) => {

  const [window, setWindow] = useState('7d');
  const [showLimit, setShowLimit] = useState(20);

  const window_options = [
    {"value": '24h', "label": "Last 24 hours"},
    {"value": '7d', "label": "Last 7 days"},
    {"value": '30d', "label": "Last 30 days"},
    {"value": 'all', "label": "All time"},
  ];
  
  function onchange_window(win){
    setWindow(win);
    get_top_projects(win, (res) => {
      for(var i in res.data){
        let project = res.data[i];
        project.image = get_asset_image_source(Array.isArray(project.thumbnail) ? project.thumbnail[0].includes("data:image") ? project.thumbnail : project.thumbnail[0] : project.thumbnail);
      }
      setListProjects(res.data);
    });
  }

  useEffect(() => {
    if(listProjects.length==0) onchange_window("7d");
  }, []);
  
  function decimal(num){
    if(num) return num.toFixed(2);
    return 0;
  }
  function add(accumulator, a) {
    return accumulator + a;
  }  
  
  return (
    <section className="section">
      <div className="container">
        <p className="is-size-1	has-text-centered">Top Cardano NFTs Projects</p>
        <p className="has-text-centered">The top CNFTs, ranked by volume, floor price and other statistics.</p>

        <nav className="level">
          {/* <div className="level-item has-text-centered">
            
          </div> */}
          <div className="level-item has-text-centered">
            <div className="control">
              <span className="select">
                <select value={window} onChange={(event) => onchange_window(event.target.value)}>
                  {
                    window_options.map((option, i) => {
                      return(
                        <option value={option.value} key={i}>{option.label}</option>
                      )
                    })
                  }
                </select>
              </span>
            </div>
          </div>
        </nav>

        <table className="table is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th></th>
              <th>Collection</th>
              <th>Volume</th>
              <th data-tooltip="Volume differences past 24 hours">24h %</th>
              <th data-tooltip="Volume differences past 7 days">7d %</th>
              <th data-tooltip="Floor price on every marketplaces">Floor price</th>
              <th data-tooltip="Total unique addresses holding assets"># Owners</th>
              <th data-tooltip="Number of assets minted"># Minted</th>
            </tr>
          </thead>
          <tbody>
            {
              listProjects.slice(0, showLimit).map((project, i) => {
                return(
                  <tr key={i}>
                    <td>{i+1}</td>
                    <td>
                      <Link to={`/collection/${project.policies[0]}`}>
                        <article className="media">
                          {
                            project.thumbnail ? (
                              <figure className="media-left">
                                <p className="image is-64x64" style={{overflow:"hidden"}}>
                                  <img className="is-rounded" src={project.image}/>
                                </p>
                              </figure>
                            ) : <></>
                          }
                          <div className="media-content">
                            <div className="content">
                              {project.name}
                            </div>
                          </div>
                        </article>
                      </Link>
                    </td>
                    <td>
                      ₳{numFormatter(project.volume)}<br/>
                    </td>
                    <td>
                      <span className={project["1dChange"]>=0?"has-text-success":"has-text-danger"}>{decimal(project["1dChange"])}%</span>
                    </td>
                    <td>
                      <span className={project["7dChange"]>=0?"has-text-success":"has-text-danger"}>{decimal(project["7dChange"])}%</span>
                    </td>
                    <td>₳{project.floor_price}</td>
                    <td>{project.total_owners.reduce(add,0)}</td>
                    <td>{project.total_minted.reduce(add,0)}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        {
          showLimit == 20 ? <button className="button is-outlined is-link is-fullwidth" onClick={() => setShowLimit(100)}>See top 100 collections</button> : <></>
        }
      </div>
    </section>
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
    get_random_assets: (callback) => dispatch(get_random_assets(callback)),
    get_top_projects: (time, callback) => dispatch(get_top_projects(time, callback)),
    
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Home);
