import React from "react";

const Guide = () => {
  return (
    <div className="section container">
      <div className="content is-large has-text-centered">
        <h1 className="is-size-1">Getting Started</h1>
        <p className="subtitle is-3">
          Things to know before jumping into the Metaverse
        </p>
      </div>

      <div className="content">
        <h2>The Basics</h2>
        <ul>
          <li>
            <h4>Which blockchain does Martify support?</h4>
            <p>
              Martify is a Cardano-based NFT marketplace, therefore only
              supporting the Cardano blockchain, for now.
            </p>
            <br />
          </li>
          <li>
            <h4>What is a crypto wallet?</h4>
            <p>
              A cryptocurrency wallet is what you need to buy, store and send
              cryptocurrencies. Unlike physical wallets, a cryptocurrency wallet
              doesn't hold any money; instead, it holds the keys needed to
              access and control cryptocurrencies on a blockchain.
            </p>
            <br />
          </li>
          <li>
            <h4>What crypto wallets can I use with Martify?</h4>
            <p>
              For now the only Cardano wallet supporting smart contract
              interactions is Nami, so in order to use Martify the user needs a
              Nami wallet. We will integrate more and more wallets as connectors
              and integrations are being released.
            </p>
            <br />
          </li>
          <li>
            <h4>How do I search for NFTs?</h4>
            <p>
              You can either search by Collection Name (The Pixel Head Squad,
              Spacebudz, …) or by Policy ID. Enter this data in the search bar
              on the home page or in the top navigation bar.
            </p>
            <br />
          </li>
          <li>
            <h4>What currencies can I use on Martify?</h4>
            <p>
              For now we only support the ADA currency. When available, we hope
              to integrate prominent Cardano-based currencies like Djed.
            </p>
            <br />
          </li>
          <li>
            <h4>How do I purchase ADA?</h4>
            <p>
              Create an account on a CEX (Coinbase, Binance, …) and buy ADA
              coins there. To use them on Martify send these funds to a Nami
              wallet.
            </p>
            <br />
          </li>
          <li>
            <h4>What are the key terms to know?</h4>
            <ul>
              <li>
                <strong>NFT</strong>: Non-Fungible Token, a Token with a total
                supply of 1. Often linked to an image, or other visual data to
                be displayed.
              </li>
              <li>
                <strong>Royalties</strong>: A percentage of the price paid to
                the NFT Creator when buying one of his NFTs.
              </li>
              <li>
                <strong>Martify Fee</strong>: We charge a 1% fee of the sale
                price on using our platform, paid when buying an NFT.
              </li>
            </ul>
          </li>
        </ul>

        <h2>Selling an NFT</h2>
        <ul>
          <li>
            <h4>How do I sell an NFT?</h4>
            <ol>
              <li>Send the NFT you want to send to a Nami wallet</li>
              <li>
                Connect this wallet to Martify via the “Connect” button at the
                top right of the website
              </li>
              <li>
                Go into your account via the button that now replaced the
                “Connect” button
              </li>
              <li>
                Here you'll have all the NFTs in your wallet. Select the NFT you
                want to sell
              </li>
              <li>Input a price (in ADA) and click on list</li>
              <li>
                If the transaction is confirmed you’ll have a message saying so.
                Congrats, your NFT is now for sale on Martify
              </li>
            </ol>
            <br />
          </li>
          <li>
            <h4>How do I list my NFT collection?</h4>
            <p>
              If you are an NFT Project wanting to launch on Martify please
              contact us on Twitter and/or Discord.
            </p>
            <br />
          </li>
          <li>
            <h4>How do royalties work on Martify?</h4>
            <p>
              Each project can submit a request to get the verified by Martify
              on our platform. When it is verified it can submit a royalty
              receiving address and percentage. After this setup, every sale on
              NFTs of that project will reward project owners the percentage
              they submitted.
            </p>
          </li>
        </ul>

        <h2>Buying an NFT</h2>
        <ul>
          <li>
            <h4>How do I purchase an NFT?</h4>
            <ol>
              <li>
                First step, if you don’t have a Nami wallet, create one and fund
                it with some ADA.
              </li>
              <li>
                Connect your wallet to Martify via the button at the top right
                corner.
              </li>
              <li>
                Search for the NFT you want to buy and click on it to go on its
                page
              </li>
              <li>
                If the NFT is not for sale you can offer a price. If it is for
                sale you can buy it with the “Buy” button.
              </li>
            </ol>
            <br />
          </li>
          <li>
            <h4>What are the fees involved when buying?</h4>
            <p>
              The buyer pays the exact amount displayed as price + Cardano
              transaction fees. 1% of this goes to Martify, x% goes to the NFT
              creator (x can be 0 if the project has not setup royalties on
              Martify), the rest goes to the seller.
            </p>
            <br />
          </li>
          <li>
            <h4>Where can I check the history of an NFT?</h4>
            <p>
              On the NFT page there is a transaction history tab, you can check
              it to see the transaction history of this NFT on Martify.
            </p>
          </li>
        </ul>
        <h2>User Safety</h2>
        <ul>
          <li>
            <h4>How to be safe when buying an NFT?</h4>
            <p>
              Look for the green or yellow check mark next to the Policy ID. It
              means that the Policy Id has been verified and is authentic. If
              there is no checkmark (possible if the project is not yet
              verified) double-check the Policy Id to make sure you are buying
              from the right collection.
            </p>
            <br />
          </li>
          <li>
            <h4>How can I report fraudulent content on Martify?</h4>
            <p>
              If you think a collection is impersonating another one, or if it
              presents explicit or violent content, please report it to us in
              Discord in the dedicated channel.
            </p>
            <br />
          </li>
          <li>
            <h4>Is explicit or sensitive content allowed on Martify?</h4>
            <p>
              We do not tolerate hate messages, bullying, racism, sexism,
              homophobia, etc… as well as explicit images or content. Please
              report this type of content to keep the Martify space enjoyable
              for everyone.
            </p>
            <br />
          </li>
          <li>
            <h4>What if I am experiencing technical issues?</h4>
            <p>
              We are sorry to hear you are experiencing issues with our
              platform. Please go through the frequently experienced issues and
              see if the fixes there help to solve your problem. If your issue
              is still going on, reach out to us on Discord via the dedicated
              channel.
            </p>
            <br />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Guide;
