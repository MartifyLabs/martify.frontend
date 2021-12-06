import React, { useEffect, useState} from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import DataTable from 'react-data-table-component';

import "./style.scss";

import Search from "../../components/Navbar/Search";
import { opencnft_get_top_projects } from "../../store/collection/api";
import { get_asset_image_source, numFormatter } from "../../utils";
import Image from "../../components/Image";

const Home = ({opencnft_get_top_projects}) => {
  
  const [listProjects, setListProjects] = useState([]);

  return (
    <div className="homepage">
      <Splash listProjects={listProjects} />
      <TopProjects opencnft_get_top_projects={opencnft_get_top_projects} listProjects={listProjects} setListProjects={setListProjects} />
    </div>
  );
};

const Splash = ({listProjects}) => {
  return (
    <>
      <div className="homepage_gallery">
        <div className={"overlay " + (listProjects.length>0?"overlay_dark":"")}></div>
        <div className="columns is-multiline is-gapless">
        {
          listProjects.slice(0, 20).map((project, i) => {
            return(
              <div className="column is-one-fifth-desktop is-full-mobile is-4-tablet" key={i}>
                <div className="card">
                  <div className="card-image">
                    <figure className="image is-square">
                      <img src={project.image} alt={project.name} />
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
            <div className="columns is-mobile is-multiline is-gapless">
              <span className="logo-text">Martify</span>
              <div className="column is-full has-text-centered">
                <p className="is-size-1 slogan" style={{color:"#fff", lineHeight:"1"}}>Your new CNFT marketplace.</p>
                <p className="is-size-5 slogan" style={{color:"#fff"}}>The smoothest experience for you to buy and sell Cardano NFTs powered by smart contracts.</p>
              </div>
            </div>
          </div>
        </div>

      </section>
    </>
  )
}

const TopProjects = ({opencnft_get_top_projects, listProjects, setListProjects}) => {
  
  const col_size = "120px";
  const show_num_projects_initial = 10;

  const [pending, setPending] = useState(false);
  const [window, setWindow] = useState('7d');
  const [showLimit, setShowLimit] = useState(show_num_projects_initial);
  const [topProjectData, setTopProjectData] = useState([]);

  const window_options = [
    {"value": '24h', "label": "Last 24 hours"},
    {"value": '7d', "label": "Last 7 days"},
    {"value": '30d', "label": "Last 30 days"},
    {"value": 'all', "label": "All time"},
  ];

  const columns = [
    {
      name: '',
      selector: row => row.rank,
      width: "55px",
      format: row => parseInt(row.rank)+1
    },
    {
      name: '',
      selector: row => [row.name, row.image],
      cell: row =>
        <Link to={`/collection/${row.policies[0]}`}>
          <article className="media">
            {
              row.thumbnail ? (
                <figure className="media-left">
                  <p className="image is-64x64" style={{overflow:"hidden"}}>
                    {/* <img className="is-rounded top-project-image" src={row.image}/> */}
                    <Image className="is-rounded top-project-image" src={row.image}/>
                  </p>
                </figure>
              ) : <></>
            }
            <div className="media-content m-auto">
              <div className="content is-size-6">
                {row.name}
              </div>
            </div>
          </article>
        </Link>
    },
    {
      name: 'Volume',
      selector: row => row.volume,
      sortable: true,
      width: col_size,
      format: row => numFormatter(row.volume)
    },
    {
      name: '24h %',
      selector: row => row["1dChange"],
      sortable: true,
      conditionalCellStyles: [
        {
          when: row => row["1dChange"] >= 0,
          classNames: ["has-text-success"]
        },
        {
          when: row => row["1dChange"] < 0,
          classNames: ["has-text-danger"]
        }
      ],
      width: col_size,
      format: row => `${parseFloat(decimal(row["1dChange"]))}%`
    },
    {
      name: '7d %',
      selector: row => row["7dChange"],
      sortable: true,
      conditionalCellStyles: [
        {
          when: row => row["7dChange"] >= 0,
          classNames: ["has-text-success"]
        },
        {
          when: row => row["7dChange"] < 0,
          classNames: ["has-text-danger"]
        }
      ],
      width: col_size,
      format: row => `${parseFloat(decimal(row["7dChange"]))}%`
    },
    {
      name: 'Floor price',
      selector: row => row.floor_price,
      sortable: true,
      width: col_size,
      format: row => `₳${row.floor_price}`
    },
    {
      name: '# Owners',
      selector: row => row.total_owners,
      width: col_size,
      format: row => numFormatter(row.total_owners.reduce(add,0))
    },
    {
      name: '# Minted',
      selector: row => row.total_minted,
      width: col_size,
      format: row => numFormatter(row.total_minted.reduce(add,0))
    },
  ];

  function prepare_data(project_list, limit){
    let list = [];
    for(var i in project_list){
      let project = project_list[i];
      project.rank = i;
      project.image = get_asset_image_source(Array.isArray(project.thumbnail) ? project.thumbnail[0].includes("data:image") ? project.thumbnail : project.thumbnail[0] : project.thumbnail);
      list.push(project);
      // if(i>=limit) break;
    }
    setListProjects(list);
    setPending(false);
  }
  
  function onchange_window(win){
    setWindow(win);
    setPending(true);
    setListProjects([]);
    setShowLimit(show_num_projects_initial);
    opencnft_get_top_projects(win, (res) => {
      setTopProjectData(res.data);
      prepare_data(res.data, show_num_projects_initial)
    });
  }

  useEffect(() => {
    if(listProjects.length===0) onchange_window("7d");
  }, []);
  
  function decimal(num){
    if(num) return num.toFixed(2);
    return 0;
  }
  function add(accumulator, a) {
    return accumulator + a;
  }

  function show_all(){
    setPending(true);
    setShowLimit(100);
    prepare_data(topProjectData, 100);
  }

  return (
    <section className="section top-project">
      <div className="container">

        <div className="columns">
          <div className="column is-2">
            
          </div>
          <div className="column is-8 has-text-centered">
            <p className="is-size-1	has-text-centered">Top Cardano NFTs Projects</p>
            <p className="has-text-centered">The top CNFTs, ranked by volume, floor price and other statistics.</p>
          </div>
          <div className="column is-2">
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
        </div>

        {
          topProjectData.length > 0 && showLimit === show_num_projects_initial ? (
            <>
              <div className="columns is-multiline">
                {
                  listProjects.slice(0, show_num_projects_initial).map((project, i) => {
                    return(
                      <div className="column is-one-fifth" key={i}>
                        <Link to={`/collection/${project.policies[0]}`}>
                          <div className="card">
                            <div className="card-image">
                              <figure className="image is-square">
                                <img className="top-project-image" src={project.image} alt={project.name} />
                                {/* <Image className="top-project-image" src={project.image} alt={project.name} /> */}
                              </figure>
                            </div>
                            <div className="card-content">
                              <div className="media">
                                <div className="media-content">
                                  <p className="title is-6 top-project-title">{project.name}</p>
                                  <p className="subtitle is-6" data-tooltip="Trading volume in ₳">₳{numFormatter(project.volume)} (
                                    <span data-tooltip={`Change in volume in past ${window==="7d"?"7 days":"1 day"}`} className={parseFloat(decimal(project[ window==="7d"?"7dChange":"1dChange" ]))>=0?"has-text-success":"has-text-danger"}>
                                      {parseFloat(decimal(project[ window==="7d"?"7dChange":"1dChange" ]))}%
                                    </span>)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )
                  })
                }
              </div>
              <button className="button is-outlined is-link is-fullwidth" onClick={() => show_all()}>See top 100 collections</button>
            </>
          ) : (
            <DataTable
              columns={columns}
              data={listProjects}
              defaultSortFieldId={3}
              defaultSortAsc={false}
              progressPending={pending}
              progressComponent={<progress className="progress is-info" max="100"></progress>}
            />
          )
        }
      </div>
    </section>
  )
}

function mapStateToProps(state, props) {
  return {
    
  };
}

function mapDispatchToProps(dispatch) {
  return {
    opencnft_get_top_projects: (time, callback) => dispatch(opencnft_get_top_projects(time, callback)),
  };
}

export default compose(connect(mapStateToProps, mapDispatchToProps))(Home);
