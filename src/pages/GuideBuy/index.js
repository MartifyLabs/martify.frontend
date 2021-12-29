import React from "react";
// import image_3_collateral from './step3-collateral.png';
// import image_3_collateral2 from './step3-collateral2.png';
// import image_4_assetpage from './step4-asset-page.png';

const GuideBuy = () => {
  return (
    <div className="section container">
      <div className="content is-large has-text-centered">
        <h1 className="is-size-1">Buying</h1>
        <p className="subtitle is-3">
          Learn how to purchase your first NFT
        </p>
      </div>

      <div className="content">
        <h2>Overview</h2>
        <ol>
          <li><b>Buy cryptocurrency</b>: Join a cryptocurrency exchange like Coinbase and fund your account with ADA.</li>
          <li><b>Setup a cryptocurrency wallet</b>: Signup for a "Non-custodial" wallet like Nami Wallet, which is where you can store and control your cryptocurrency and digital assets. Transfer your ADA coins from Coinbase to your wallet, which gives you the control to purchase NFTs across the various NFT marketplaces.</li>
          <li><b>Connect Nami Wallet on Martify and add collateral</b>: That is easy!</li>
          <li><b>Purchase your first NFT</b>: Purchasing your first NFT on <a href="explore">Martify</a>.</li>
        </ol>

        <h2>Step 1: Acquiring Cardano (ADA) cryptocurrency</h2>
        {/* <h3>Overview: Step 1</h3> */}
        <ol>
          <li><b>Join a cryptocurrency exchange</b>: Join a cryptocurrency exchange like Coinbase or Binance to purchase, store, and transfer your cryptocurrency. Coinbase recommends a minimum of $50 to get started.</li>
          <li><b>Send in required documents</b>: Just like any standard trading platforms, you will need to be approved to begin buying and selling cryptocurrency. Send in your required documents and sync a payment source.</li>
          <li><b>Buy ADA coins</b>: ADA coin is a cryptocurrency that is part of the Cardano blockchain, which is the system and currency used to purchase and store NFTs.</li>
        </ol>

        <p>Your first step on this NFT journey is purchasing cryptocurrency in the form of ADA. ADA is the cryptocurrency that coincides with the Cardano network and is what is used when purchasing NFTs on the Cardano network. The purchase of ADA will allow you to make bids on and purchase NFTs through various NFT marketplaces.</p>

        <p>To purchase ADA, you will need to join a centralized exchange such as <a href="https://www.coinbase.com/">Coinbase</a>. Coinbase is an exchange where one can purchase, buy, sell, convert, and send cryptocurrency. In a way, Coinbase is like how one would interact with the stock market. If you are familiar with stock trading platforms, you will be extremely comfortable in Coinbase.</p>
        <p>Coinbase is quick to set up, but you may need a few days before everything is approved. Coinbase needs <a href="https://help.coinbase.com/en/coinbase/getting-started/getting-started-with-coinbase/id-doc-verification">Identity Documentation</a> such as a passport or driver’s license and then approval of a <a href="https://help.coinbase.com/en/coinbase/getting-started#add-a-payment-method">Payment Method</a>.</p>

        <h2>Step 2: Setup a cryptocurrency wallet</h2>
        {/* <h3>Overview: Step 2</h3> */}
        <ol>
          <li><b>Download a cryptocurrency wallet</b>: Download the <a href="https://namiwallet.io/">Nami Wallet</a> browser extension, which will be your own personal "digital wallet". With Nami Wallet, you get to store and use your cryptocurrency and digital assets (like NFTs).</li>
          <li><b>Setup Nami Wallet</b>: Write down and confirm your seed phrase, and input a new password.</li>
          <li><b>Fund your Nami Wallet</b>: Transfer your ADA from Coinbase to Nami Wallet.</li>
        </ol>

        <p>Now that you have purchased your ADA coins, you may want to put them into action, like purchasing an NFT from Martify or any of the various Cardano NFT marketplaces. To do so, you need a "Non-Custodial" wallet such as Nami Wallet. "Non-Custodial" wallets give you complete control over your crypto assets, as there is no third party involved. You cannot simply take your ADA coin from Coinbase to make purchases on an NFT marketplace as Coinbase is still technically controlling your assets. Once you transfer your currency from Coinbase to your wallet, you are free to do as you please!</p>

        <p>Go to <a href="https://namiwallet.io/">Nami Wallet</a> to download the browser extension. <b>Important</b>: To avoid any scam, we recommend you to visit their official page and then select the desired browser type to install the application. If you click on Chrome, you will be automatically taken to the Google Chrome web store. Click "Add extension" and it will be downloaded and installed. Once installed, you will be able to view the Nami Wallet icon (a blue "N") in the top right corner of your browser.</p>

        <p>If you open up the Nami Wallet for the first time. Make sure no one is watching your screen and click on "New Wallet". Then, it will show you 24-words sequence, these words are called "seed phrase", these sequence of words are the access to your wallet. Remember, this must be hidden and never shared with anyone. Do not take a picture or screenshot of your seed phrase. Instead, write it down immediately on a piece of paper and put it in a secret and safe location. Even better, write your seed phrase down on 2-3 pieces of paper and store each paper in a separate secure location (like one in a personal safe and one in a bank safety deposit box). Alternatively, you can download the seed phrase and keep it offline on an encrypted hard drive. Having multiple backups of your seed phrase is good practice just in case one copy is ever lost or destroyed. After documenting your seed phrase, click "Next".</p>

        <p>Nami Wallet will prompt you to input all those words in the next step. You confirm your seed phrase in the correct order of your 24-word sequence. You will also be prompt to input a password, which is needed whenever you have to sign a transaction. You can now access your Nami Wallet via "N" icon in your browser and begin purchasing and receiving crypto. If you already have ADA in your Coinbase, you can use your brand new Cardano address to transfer them over into your Nami Wallet.</p>

        <p>Now that you have your Nami Wallet, you will want to transfer your funds out of Coinbase. You need to get your wallet address, by clicking on the "Receive" button, you can copy your Cardano address. If you are using Coinbase on your smartphone, you can also scan the QR code from the Coinbase application. <b>Important</b>: you must send your ADA via the Cardano network. It would take a few minutes to get your ADA transfer from Coinbase to your Nami Wallet.</p>

        <h2>Step 3: Connect Nami Wallet on Martify and add collateral</h2>

        {/* <h3>Overview: Step 3</h3> */}
        <ol>
          <li><b>Connect wallet</b>: Click on connect and allow access.</li>
          <li><b>Add collateral</b>: Deposit 5₳ as collateral from Nami Wallet.</li>
        </ol>

        <p>You have purchased your ADA coins, and transferred it to your Nami Wallet, now you are ready to browse and purchase some NFTs on the marketplace. Click on "Connect" on the top right corner. It should recognized that you have Nami Wallet installed and it will prompt your for access on the first time. If it does not, you may have to restart your web browser. Click on "Access" to allow Martify to connect to your Nami Wallet. No transaction will take place until you decided to make a purchase and provided your signature.</p>

        <p>The Nami Wallet allows you to deposit a fixed amount (5₳) as collateral to avoid any circumstances that arise due to contract failure. In the event of a contract failure, a collateral is taken to cover the blockchain resources used by the node to verify the contract. That means collateral aims to secure the network and avoid network failure. When a script runs successfully, the collateral is not taken. The chances of losing the collateral are very low; however, Nami seeks to minimize the risk by only allowing a determined amount (5₳) of collateral to be used. In a worst case scenario, malicious, or poorly built dApps, would only be able to take this amount. To deposit tokens into collateral, go to the Setting tab, and click on Collateral. A window will pop up where you need to enter your wallet’s password to confirm the process. At any time, you can remove the collateral by clicking on the "Remove" button.</p>
        
        {/* <div className="columns">
          <div className="column">
            <figure className="image">
              <img src={image_3_collateral} />
            </figure>
          </div>
          <div className="column">
            <figure className="image">
              <img src={image_3_collateral2} />
            </figure>
          </div>
        </div> */}

        <h2>Step 4: Purchase your first NFT</h2>

        {/* <h3>Overview: Step 4</h3> */}

        {/* <figure className="image">
          <img src={image_4_assetpage} />
        </figure> */}

        <ol>
          <li><b>Browse NFTs</b>: Browse the <a href="explore">explore page</a>.</li>
          <li><b>Make the transaction</b>: Click on Buy Now to confirm the transaction.</li>
        </ol>

        <p>Start by browsing listed assets on the <a href="explore">explore page</a>, there you can sort the assets by price or filter by the projects you are interested in. Clicking on the the asset will bring you to the asset page, here you can see the asset's metadata, past transactions on all marketplaces, as well as the current listing price. Click on "Buy Now", your Nami Wallet will prompt you for your password. Sign it to approve the transaction and the NFT will be in your Nami Wallet in a few minutes. If your "Buy Now" button is disabled, check that you have connected your wallet and added the collateral.</p>

      </div>
    </div>
  );
};

export default GuideBuy;
