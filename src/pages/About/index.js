import React from "react";

import "./style.scss";

const heros = [
  {
    name: "Alain Magazin",
    role: "Co-Founder",
    picture: "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/alain.magazin.jpg?alt=media&token=b5c3136a-5cb9-4d21-9753-487b7c867401",
    github: "https://github.com/AlainMgz",
    linkedin: "https://www.linkedin.com/in/alain-magazin-36a403213",
    twitter: "https://twitter.com/adotmgz",
  },
  {
    name: "Abdelkrim Dib",
    role: "Co-Founder",
    picture: "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/abdelkrim.dib.jpg?alt=media&token=bc6b7264-7ba3-4b4e-9d92-96e2c7de7440",
    github: "https://github.com/abdelkrimdev",
    linkedin: "https://www.linkedin.com/in/abdelkrimdev",
    twitter: "https://twitter.com/abdelkrimdev",
  },
  {
    name: "Hong Jing",
    role: "Contributor",
    picture: "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/hong.jing.jpg?alt=media&token=18f12730-5c1e-46b3-b82c-3cdce3ef95a9",
    github: "https://github.com/jinglescode",
    linkedin: "https://www.linkedin.com/in/jingles",
    twitter: "https://twitter.com/jinglescode",
  },
  {
    name: "Kazune Takeda",
    role: "Contributor",
    picture: "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/kazune.takeda.jpg?alt=media&token=956ba4e0-2138-475f-9b16-f8c69f8cf903",
    github: "https://github.com/kazunetakeda25",
    linkedin: "https://www.linkedin.com/in/kazunetakeda25",
    twitter: "https://twitter.com/kazunetakeda25",
  },
  {
    name: "John Stewart",
    role: "Contributor",
    picture: "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/john.stewart.jpg?alt=media&token=34c1a788-f81b-4206-85a6-8ffa5a0705dc",
    github: "https://github.com/johnstewart0820",
    linkedin: "https://www.linkedin.com/in/john-stewart-64b72a219",
    twitter: "#",
  },
  {
    name: "Mahajna Mahmod",
    role: "Contributor",
    picture: "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/mahmod.mahajna.jpg?alt=media&token=b7721420-f4ba-48f1-848c-1c1dc1e3c1cd",
    github: "https://github.com/mahajnamahmod",
    linkedin: "https://www.linkedin.com/in/mahmod-mahajna-57911789",
    twitter: "https://twitter.com/CryptoDreamzNFT",
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
            <i className="fas fa-wind"></i>
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
            <i className="fas fa-snowflake"></i>
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
            <i className="fas fa-seedling"></i>
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
            <i className="fas fa-sun"></i>
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
            <i className="fas fa-wind"></i>
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
        <div className="columns is-multiline">
          {heros.map((hero) => (
            <div className="column is-one-third" key={hero.name}>
              <div className="card">
                <div className="card-image">
                  <figure className="image is-clipped">
                    <img
                      src={hero.picture}
                      alt={hero.name}
                    />
                  </figure>
                </div>
                <div className="card-content">
                  <div className="media">
                    <div className="media-content">
                      <p className="title is-4">{hero.name}</p>
                      <p className="subtitle is-6">{hero.role}</p>
                    </div>
                  </div>
                </div>
                <footer className="card-footer">
                  <a href={hero.github} className="card-footer-item">
                    <i className="fab fa-github"></i>
                  </a>
                  <a href={hero.linkedin} className="card-footer-item">
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a href={hero.twitter} className="card-footer-item">
                    <i className="fab fa-twitter"></i>
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
