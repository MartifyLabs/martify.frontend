import React from "react";

const GuideSell = () => {
  return (
    <div className="section container">
      <div className="content is-large has-text-centered">
        <h1 className="is-size-1">Selling</h1>
        <p className="subtitle is-3">
          Learn how list your NFTs for sale
        </p>
      </div>

      <div className="content">
        <h2>Overview</h2>
        <ol>
          <li><b>Setup Nami Wallet</b>: Download Nami Wallet.</li>
          <li><b>Connect Nami Wallet on Martify and add collateral</b>: That is easy!</li>
          <li><b>List your first NFT</b>: Transfer your assets from Yoroi to your Nami Wallet and list them on Martify.</li>
        </ol>

        <h2>Step 1: Setup Nami Wallet</h2>
        
        <ol>
          <li><b>Download Nami Wallet</b>: Download the <a href="https://namiwallet.io/">Nami Wallet</a> browser extension, which will be your own personal "digital wallet". With Nami Wallet, you get to store and use your cryptocurrency and digital assets (like NFTs).</li>
          <li><b>Setup Nami Wallet</b>: Write down and confirm your seed phrase, and input a new password.</li>
        </ol>

        <p>Go to <a href="https://namiwallet.io/">Nami Wallet</a> to download the browser extension. <b>Important</b>: To avoid any scam, we recommend you to visit their official page and then select the desired browser type to install the application. If you click on Chrome, you will be automatically taken to the Google Chrome web store. Click "Add extension" and it will be downloaded and installed. Once installed, you will be able to view the Nami Wallet icon (a blue "N") in the top right corner of your browser.</p>

        <p>If you open up the Nami Wallet for the first time. Make sure no one is watching your screen and click on "New Wallet". Then, it will show you 24-words sequence, these words are called "seed phrase", these sequence of words are the access to your wallet. Remember, this must be hidden and never shared with anyone. Do not take a picture or screenshot of your seed phrase. Instead, write it down immediately on a piece of paper and put it in a secret and safe location. Even better, write your seed phrase down on 2-3 pieces of paper and store each paper in a separate secure location (like one in a personal safe and one in a bank safety deposit box). Alternatively, you can download the seed phrase and keep it offline on an encrypted hard drive. Having multiple backups of your seed phrase is good practice just in case one copy is ever lost or destroyed. After documenting your seed phrase, click "Next".</p>

        <p>Nami Wallet will prompt you to input all those words in the next step. You confirm your seed phrase in the correct order of your 24-word sequence. You will also be prompt to input a password, which is needed whenever you have to sign a transaction. You can now access your Nami Wallet via "N" icon in your browser.</p>

        <h2>Step 2: Connect Nami Wallet on Martify and add collateral</h2>

        <ol>
          <li><b>Connect wallet</b>: Click on connect and allow access.</li>
          <li><b>Add collateral</b>: Deposit 5₳ as collateral from Nami Wallet.</li>
        </ol>

        <p>With Nami Wallet installed, click on "Connect" on the top right corner. It should recognized that you have Nami Wallet installed and it will prompt your for access on the first time. If it does not, you may have to restart your web browser. Click on "Access" to allow Martify to connect to your Nami Wallet.</p>

        <p>The Nami Wallet allows you to deposit a fixed amount (5₳) as collateral to avoid any circumstances that arise due to contract failure. In the event of a contract failure, a collateral is taken to cover the blockchain resources used by the node to verify the contract to avoid network failure. When a script runs successfully, the collateral is not taken. The chances of losing the collateral are very low; however, Nami seeks to minimize the risk by only allowing a determined amount (5₳) of collateral to be used. In a worst case scenario, malicious, or poorly built dApps, it would only be able to take this amount. To deposit ADA into collateral, go to the Setting tab, and click on Collateral. A window will pop up where you need to enter your wallet’s password to confirm the process. At any time, you can remove from collateral by clicking on the "Remove" button.</p>

        <h2>Step 3: List your first NFT</h2>

        <ol>
          <li><b>Transfer your assets</b>: Send your assets into Nami Wallet.</li>
          <li><b>List on Martify</b>: Connect and list your NFTs for sale.</li>
        </ol>

        <p>Now that you have your Nami Wallet, you will want to transfer your assets from other wallets into your new Nami Wallet. For that, you need to get your wallet address, by click on the "Recieve" button, you can copy your Cardano address. It would take a few minutes to get your assets transfer from your wallet to your new Nami Wallet.</p>

        <p>Click on Connect if you have not, and click on Account to browse the assets in your Nami Wallet. Clicking on an asset will bring you to the asset page, here you can see the asset's metadata. On this page, you can set your listing price, your Nami Wallet will prompt you for your password. Sign it to approve the transaction and the NFT will be transfered to the smart contract. If you are unable to list the asset, check that you have connected your wallet and added the collateral.</p>


        {/* <h2>How to add royalties?</h2>
        NFTs can be programmed so that each transaction includes royalties, allowing creators to be rewarded fairly for their work online. The fact that NFTs are created and stored on the blockchain, means they can be traded seamlessly from wallet to wallet, with royalties paid every time they move. On Martify, creators can set royalties up to 10%, and connect us via <a href="https://twitter.com/MartifyLabs">Twitter</a> or <a href="https://twitter.com/MartifyLabs">Discord</a> */}

      </div>
    </div>
  );
};

export default GuideSell;
