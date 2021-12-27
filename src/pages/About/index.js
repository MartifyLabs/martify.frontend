import React from "react";

import "./style.scss";

const heros = [
  {
    name: "Alain Magazin",
    picture: "",
    github: "https://github.com/AlainMgz",
    linkedin: "https://www.linkedin.com/in/alain-magazin-36a403213",
    twitter: "https://twitter.com/adotmgz",
  },
  {
    name: "Abdelkrim Dib",
    photo: "",
    github: "https://github.com/abdelkrimdev",
    linkedin: "https://www.linkedin.com/in/abdelkrimdev",
    twitter: "https://twitter.com/abdelkrimdev",
  },
  {
    name: "Hong Jing",
    picture: "",
    github: "https://github.com/jinglescode",
    linkedin: "https://www.linkedin.com/in/jingles",
    twitter: "https://twitter.com/jinglescode",
  },
  {
    name: "Kazune Takeda",
    picture: "",
    github: "https://github.com/kazunetakeda25",
    linkedin: "https://www.linkedin.com/in/kazunetakeda25",
    twitter: "https://twitter.com/kazunetakeda25",
  },
  {
    name: "John Stewart",
    picture: "",
    github: "https://github.com/johnstewart0820",
    linkedin: "https://www.linkedin.com/in/john-stewart-64b72a219",
    twitter: "",
  },
  {
    name: "Mahajna Mahmod",
    picture: "",
    github: "https://github.com/mahajnamahmod",
    linkedin: "",
    twitter: "",
  },
];

const About = () => {
  return (
    <div className="about section container">
      <div className="content has-text-centered">
        <h2 className="is-size-2">The Martify Marketplace</h2>
      </div>
      <div className="description">
        <div className="content is-medium has-text-centered">
          <p>
            Martify is a marketplace for Cardano Non-Fungible Tokens. Our goal
            is to make it easy for everyone to trade NFTs in a fast, safe and
            secure manner. Try us out and you'll fall in love with our simple
            and intuitive user interface. If you have any ideas to improve user
            experience, feel free to reach out to us at contact@martify.io, on
            @MartifyLabs or join us in our to discuss favorite projects, feature
            suggestions, giveaways and other cool things.
          </p>
        </div>
      </div>

      <div className="content has-text-centered">
        <h2 className="is-size-2">The Product Roadmap</h2>
      </div>
      <div className="timeline">
        <div className="timeline-container warning">
          <div className="timeline-icon">
            <i class="fas fa-wind"></i>
          </div>
          <div className="timeline-body">
            <h4 className="timeline-title">
              <span className="badge">Q4 2021</span>
            </h4>
            <div className="content is-medium">
              <ul>
                <li>
                  Marketplace launch with basic functionnalities : List, Buy,
                  Update Price, Cancel Listing, Offers, ...
                </li>
                <li>Team building</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="timeline-container info">
          <div className="timeline-icon">
            <i class="fas fa-snowflake"></i>
          </div>
          <div className="timeline-body">
            <h4 className="timeline-title">
              <span className="badge">Q1 2022</span>
            </h4>
            <div className="content is-medium">
              <ul>
                <li>Marketing campaign</li>
                <li>New feature : NFT Bundle Swaps</li>
                <li>New feature : Native Token support for partner projects</li>
                <li>UI/UX and branding update</li>
                <li>Tokenomics and whitepaper (including governance)</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="timeline-container success">
          <div className="timeline-icon">
            <i class="fas fa-seedling"></i>
          </div>
          <div className="timeline-body">
            <h4 className="timeline-title">
              <span className="badge">Q2 2022</span>
            </h4>
            <div className="content is-medium">
              <ul>
                <li>New feature : On-chain Auctions</li>
                <li>Martify integration with parner wallets</li>
                <li>Seed round and private sales</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="timeline-container danger">
          <div className="timeline-icon">
            <i class="fas fa-sun"></i>
          </div>
          <div className="timeline-body">
            <h4 className="timeline-title">
              <span className="badge">Q3 2022</span>
            </h4>
            <div className="content is-medium">
              <ul>
                <li>Public API containing all marketplace features</li>
                <li>
                  Back-office for NFT Projects to launch their own marketplace
                  using Martify API
                </li>
                <li>Initial Stake Pool Offering</li>
                <li>Marketing Campaign</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="timeline-container warning">
          <div className="timeline-icon">
            <i class="fas fa-wind"></i>
          </div>
          <div className="timeline-body">
            <h4 className="timeline-title">
              <span className="badge">Q4 2022</span>
            </h4>
            <div className="content is-medium">
              <ul>
                <li>
                  Martify integration with game engines (Unreal Engine, Unity,
                  ...)
                </li>
                <li>Governance implementation using Martify token</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="content has-text-centered">
        <h2 className="is-size-2">The Team Behind</h2>
      </div>
      <div className="people">
        <div class="columns is-multiline">
          {heros.map((hero) => (
            <div class="column is-one-third">
              <div class="card">
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img
                      src="https://bulma.io/images/placeholders/1280x960.png"
                      alt="Placeholder image"
                    />
                  </figure>
                </div>
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-48x48">
                        <img
                          src="https://bulma.io/images/placeholders/96x96.png"
                          alt="Placeholder image"
                        />
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-4">John Smith</p>
                      <p class="subtitle is-6">@johnsmith</p>
                    </div>
                  </div>

                  <div class="content">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Phasellus nec iaculis mauris. <a>@bulmaio</a>.
                    <a href="#">#css</a> <a href="#">#responsive</a>
                    <br />
                    <time datetime="2016-1-1">11:09 PM - 1 Jan 2016</time>
                  </div>
                </div>
                <footer class="card-footer">
                  <a href="#" class="card-footer-item">
                    Save
                  </a>
                  <a href="#" class="card-footer-item">
                    Edit
                  </a>
                  <a href="#" class="card-footer-item">
                    Delete
                  </a>
                </footer>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
