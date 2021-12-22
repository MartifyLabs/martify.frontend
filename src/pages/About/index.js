import React from "react";

const About = () => {
  return (
    <div className="section container">
      <div className="content is-large has-text-centered">
        <h2 className="is-size-2">Martify</h2>
        <p className="subtitle is-4">
          Martify is a marketplace for Cardano Non-Fungible Tokens. Our goal is
          to make it easy for everyone to trade NFTs in a fast, safe and secure
          manner. Try us out and you’ll fall in love with our simple and
          intuitive user interface. If you have any ideas to improve user
          experience, feel free to reach out to us at contact@martify.io, on
          Twitter @martify_labs or join us in our Discord to discuss favorite
          projects, feature suggestions, giveaways and other cool things.
        </p>
      </div>

      <div className="content is-large has-text-centered">
        <h2 className="is-size-2">Roadmap</h2>
      </div>
      <div className="content">
        <ul>
          <li>
            <h4>Q4 2021</h4>
            <ol>Launch on mainnet with basic functionnalities : List, Buy, Update Price, Cancel Listing, Offers, ...</ol>
            <ol>Team building</ol>
          </li>
          <li>
            <h4>Q1 2022</h4>
            <ol>Marketing campaign</ol>
            <ol>New feature : NFT-to-NFT trading</ol>
            <ol>New feature : Native Token support for partner projects</ol>
            <ol>UI/UX and branding update</ol>
            <ol>Tokenomics and whitepaper</ol>
          </li>
          <li>
            <h4>Q2 2022</h4>
            <ol>New feature : On-chain Auction system</ol>
            <ol>Seed round and private sales</ol>
            <ol>Governance Paper</ol>
          </li>
          <li>
            <h4>Q3 2022</h4>
            <ol>Extend integration features for Gaming/Metaverse projects</ol>
            <ol>Initial Stake Pool Offering</ol>
            <ol>Marketing Campaign</ol>
          </li>
          <li>
            <h4>Q4 2022</h4>
            <ol>Martify integration for game engines (Unreal Engine, Unity, ...)</ol>
            <ol>API including NFT Minting, Forging, Burning, Swapping, Native Token support, ...</ol>
            <ol>Integrate in wallet (Maybe Genius)</ol>
            <ol>Governance implementation</ol>
          </li>
        </ul>
      </div>
     

      <div className="content is-large has-text-centered">
        <h2 className="is-size-2">Team</h2>
        <p className="subtitle is-4">Work in Progress...</p>
      </div>
    </div>
  );
};

export default About;
