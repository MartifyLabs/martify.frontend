import React from "react";

const About = () => {
  return (
    <div className="section container">
      <div className="content is-large has-text-centered">
        <h2 className="is-size-2">Martify</h2>
        <p className="subtitle is-4">
          Martify is a marketplace for Cardano Non-Fungible Tokens. Our goal is
          to make it easy for everyone to trade NFTs in a fast, safe and secure
          manner. Try us out and you'll fall in love with our simple and
          intuitive user interface. If you have any ideas to improve user
          experience, feel free to reach out to us at contact@martify.io, on
          Twitter @MartifyLabs or join us in our Discord to discuss favorite
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
            <ol>Marketplace launch with basic functionnalities : List, Buy, Update Price, Cancel Listing, Offers, ...</ol>
            <ol>Team building</ol>
          </li>
          <li>
            <h4>Q1 2022</h4>
            <ol>Marketing campaign</ol>
            <ol>New feature : NFT Bundle Swaps</ol>
            <ol>New feature : Native Token support for partner projects</ol>
            <ol>UI/UX and branding update</ol>
            <ol>Tokenomics and whitepaper (including governance)</ol>
          </li>
          <li>
            <h4>Q2 2022</h4>
            <ol>New feature : On-chain Auctions</ol>
            <ol>Martify integration with parner wallets</ol>
            <ol>Seed round and private sales</ol>
          </li>
          <li>
            <h4>Q3 2022</h4>
            <ol>Public API containing all marketplace features</ol>
            <ol>Back-office for NFT Projects to launch their own marketplace using Martify API</ol>
            <ol>Initial Stake Pool Offering</ol>
            <ol>Marketing Campaign</ol>
          </li>
          <li>
            <h4>Q4 2022</h4>
            <ol>Martify integration with game engines (Unreal Engine, Unity, ...)</ol>
            <ol>Governance implementation using Martify token</ol>
          </li>
        </ul>
      </div>
     

      <div className="content is-large has-text-centered">
        <h2 className="is-size-2">Team members</h2>
      </div>
      <div className="content">
        <ul>
          <li>
            <h4>Alain Magazin</h4>
            <ol>Co-founder & Plutus Developer</ol>
            <ol><a href="https://www.linkedin.com/in/alain-magazin-36a403213/">Linkedin</a></ol>
            <ol><a href="https://github.com/AlainMgz">Github</a></ol>
          </li>
          <li>
            <h4>Abdelkrim Dib</h4>
            <ol>Co-founder, Full-stack & Plutus Developer</ol>
            <ol><a href="https://www.linkedin.com/in/abdelkrimdev/">Linkedin</a></ol>
            <ol><a href="https://github.com/abdelkrimdev">Github</a></ol>
          </li>
          <li>
            <h4>Hong Jing K.</h4>
            <ol>Full-stack Developer</ol>
            <ol><a href="https://www.linkedin.com/in/jingles/">Linkedin</a></ol>
            <ol><a href="https://github.com/jinglescode">Github</a></ol>
          </li>
          <li>
            <h4>Kazune Takeda</h4>
            <ol>Full-stack Developer</ol>
          </li>
        </ul>
      </div>
        
      
    </div>
  );
};

export default About;
