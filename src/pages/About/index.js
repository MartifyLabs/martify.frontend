import React from "react";

import "./style.scss";

const heros = [
  {
    name: "Alain Magazin",
    role: "Co-Founder",
    picture:
      "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/alain.magazin.jpg?alt=media&token=b5c3136a-5cb9-4d21-9753-487b7c867401",
    github: "https://github.com/AlainMgz",
    linkedin: "https://www.linkedin.com/in/alain-magazin-36a403213",
    twitter: "https://twitter.com/adotmgz",
  },
  {
    name: "Abdelkrim Dib",
    role: "Co-Founder",
    picture:
      "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/abdelkrim.dib.jpg?alt=media&token=bc6b7264-7ba3-4b4e-9d92-96e2c7de7440",
    github: "https://github.com/abdelkrimdev",
    linkedin: "https://www.linkedin.com/in/abdelkrimdev",
    twitter: "https://twitter.com/abdelkrimdev",
  },
  {
    name: "Jingles",
    role: "Co-Founder",
    picture:
      "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/hong.jing.jpg?alt=media&token=18f12730-5c1e-46b3-b82c-3cdce3ef95a9",
    github: "https://github.com/jinglescode",
    linkedin: "https://www.linkedin.com/in/jingles",
    twitter: "https://twitter.com/jinglescode",
  },
  {
    name: "Kazune Takeda",
    role: "Contributor",
    picture:
      "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/kazune.takeda.jpg?alt=media&token=956ba4e0-2138-475f-9b16-f8c69f8cf903",
    github: "https://github.com/kazunetakeda25",
    linkedin: "https://www.linkedin.com/in/kazunetakeda25",
    twitter: "https://twitter.com/kazunetakeda25",
  },
  {
    name: "John Stewart",
    role: "Contributor",
    picture:
      "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/john.stewart.jpg?alt=media&token=34c1a788-f81b-4206-85a6-8ffa5a0705dc",
    github: "https://github.com/johnstewart0820",
    linkedin: "https://www.linkedin.com/in/john-stewart-64b72a219",
    twitter: "#",
  },
  {
    name: "Mahajna Mahmod",
    role: "Contributor",
    picture:
      "https://firebasestorage.googleapis.com/v0/b/martify-bc2f5.appspot.com/o/mahmod.mahajna.jpg?alt=media&token=b7721420-f4ba-48f1-848c-1c1dc1e3c1cd",
    github: "https://github.com/mahajnamahmod",
    linkedin: "https://www.linkedin.com/in/mahmod-mahajna-57911789",
    twitter: "https://twitter.com/CryptoDreamzNFT",
  },
];

const About = () => {
  return (
    <div className="about section container">
      <div className="content has-text-centered">
        <h2 className="is-size-2">The Martify Digital Universe</h2>
      </div>
      <div className="description">
        <div className="content is-medium has-text-centered">
          <p>
            Martify is a community-driven ecosystem for Cardano Non-Fungible
            Tokens. Our goal is to make NFT trading accessible everywhere you
            can imagine. Martify Marketplace is your one-stop shop for Cardano
            NFTs where you can explore your favorite collections and trade
            assets in a secure manner. Want to get in touch with us? You can
            write at
            <a href="mailto:contact@martify.io">
              <i className="icon fas fa-envelope"></i>contact@martify.io
            </a>
            , on
            <a href="https://twitter.com/MartifyLabs" target="_blank" rel="noreferrer">
              <i className="icon fab fa-twitter"></i>@MartifyLabs
            </a>
            , or join our
            <a href="https://discord.gg/Z6AH9dahdH" target="_blank" rel="noreferrer">
              <i className="icon fab fa-discord"></i>Discord
            </a>{" "}
            and participate in community discussions about the digital universe
            and future development.
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
                  Write a Plutus Smart Contract with Essential Market Features.
                </li>
                <li>Implement an Initial Version of The Marketplace UI.</li>
                <li>Nami Wallet Integration.</li>
                <li>Smart Contract Integration.</li>
                <li>Fully Open Source The Marketplace Codebase.</li>
                <li>Mainnet Deployment.</li>
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
                <li>Handle Audio & Video Assets.</li>
                <li>Build The Martify Backend APIs.</li>
                <li>Implement Trading & Bundle Swaps for NFTs.</li>
                <li>Enable Buying & Selling NFTs Using Native Tokens.</li>
                <li>Focus on Branding, New Logo, & UI/UX.</li>
                <li>
                  Establish New Partnerships with Gaming and Metaverse Projects.
                </li>
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
                <li>Implement On-Chain Auctions & Bidding.</li>
                <li>Add Support to More Wallets (Yoroi, ccvault.io...).</li>
                <li>Create & Launch a Stake Pool for Martify.</li>
                <li>
                  Write a Whitepaper for Smart Contract On-Chain Governance.
                </li>
                <li>Design the Tokennomics.</li>
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
                <li>Initial Stake Pool Offering.</li>
                <li>Create a Launchpad for New NFT Projects.</li>
                <li>Release The Martify Backend APIs as a Service.</li>
                <li>Improve Projects Findability & Discoverability.</li>
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
                <li>Martify Integration with Unity Game Engine.</li>
                <li>Implement the Smart Contract On-Chain Governance.</li>
                <li>Create an Automatic Verification System for Creators.</li>
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
                    <img src={hero.picture} alt={hero.name} />
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
                  <a
                    className="card-footer-item"
                    href={hero.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fab fa-github"></i>
                  </a>
                  <a
                    className="card-footer-item"
                    href={hero.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <i className="fab fa-linkedin"></i>
                  </a>
                  <a
                    className="card-footer-item"
                    href={hero.twitter}
                    target="_blank"
                    rel="noreferrer"
                  >
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
