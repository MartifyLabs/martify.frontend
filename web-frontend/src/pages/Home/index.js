import React from "react";

import "./style.scss";
import Search from "../../components/Navbar/Search";

const Home = () => {
  return (
    <div className="homepage">
      <div className="homepage_gallery">

        <img className="homepage_images" src='https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1510771463146-e89e6e86560e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        {/* <img className="homepage_images" src='https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/>
        <img className="homepage_images" src='https://images.unsplash.com/photo-1504595403659-9088ce801e29?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ' alt=''/> */}
        <img className="homepage_images" src='https://infura-ipfs.io/ipfs/Qmdk5vhzDkL7CsXgUkHdM2x6xEiR28E2YXT4LVyxk6t7zY' alt=''/>
        <img className="homepage_images" src='https://infura-ipfs.io/ipfs/QmbsfbggSMpdWdpCztknPZ6svV1rUDn1MtXqVwaNNoLgLg' alt=''/>
        <img className="homepage_images" src='https://infura-ipfs.io/ipfs/QmSt1GyAwEZmYJgWJLxmEPUwVhEauFJdw8znHkhBXupUTP' alt=''/>
        <img className="homepage_images" src='https://infura-ipfs.io/ipfs/QmaXCeBT6BgHrNEjnkhgEzvAChMAHYCARdPbn3vhoCLXJC' alt=''/>
        <img className="homepage_images" src='https://infura-ipfs.io/ipfs/Qmc5apNaFzRunLcnn6FCemp5jpxyMV6DBzRJwrvm2M4yjA' alt=''/>
    </div>

    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-mobile">
            <div className="column is-half is-offset-one-quarter">
              <Search size="is-large" />
            </div>
          </div>
        </div>
      </div>

      <div className="hero-foot">
        <nav className="tabs">
          <div className="container">
            <ul>
              <li><a>About</a></li>
              <li><a>FAQ</a></li>
              <li><a>Team</a></li>
              <li><a>How It Works</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </section>

    </div>
  );
};

export default Home;
