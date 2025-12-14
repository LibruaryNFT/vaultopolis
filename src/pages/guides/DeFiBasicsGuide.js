import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageWrapper from "../../components/PageWrapper";
import ContentPanel from "../../components/ContentPanel";
import Card from "../../components/Card";
import Button from "../../components/Button";

function DeFiBasicsGuide() {
  const topics = [
    {
      title: "What is a Blockchain?",
      content: (
        <div className="space-y-4">
          <p className="text-brand-text/80">
            A blockchain is a digital ledger that records transactions across many computers. Think of it as a public spreadsheet that everyone can see and verify, but no one can change once something is recorded.
          </p>
          <p className="text-brand-text/80">
            <strong>Key features:</strong>
          </p>
          <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
            <li><strong>Decentralized:</strong> No single company or person controls it</li>
            <li><strong>Transparent:</strong> All transactions are publicly visible</li>
            <li><strong>Secure:</strong> Uses cryptography to protect data</li>
            <li><strong>Immutable:</strong> Once recorded, transactions can't be changed</li>
          </ul>
          <div className="bg-brand-secondary p-3 rounded border border-brand-border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 Flow Blockchain:</h4>
            <p className="text-sm text-brand-text/70">Vaultopolis uses the Flow blockchain, which is designed specifically for NFTs and digital collectibles like NBA Top Shot Moments. It's fast, efficient, and user-friendly.</p>
          </div>
        </div>
      )
    },
    {
      title: "What is a Wallet?",
      content: (
        <div className="space-y-4">
          <p className="text-brand-text/80">
            A crypto wallet is like a digital bank account that lets you store, send, and receive cryptocurrencies and NFTs. It consists of:
          </p>
          <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
            <li><strong>Public Address:</strong> Like a bank account number—you share this to receive funds (starts with 0x)</li>
            <li><strong>Private Key:</strong> Like a password—you keep this secret and never share it</li>
          </ul>
          <p className="text-brand-text/80">
            <strong>Types of wallets:</strong>
          </p>
          <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
            <li><strong>Software Wallet:</strong> An app on your phone or computer (e.g., Flow Wallet)</li>
            <li><strong>Hardware Wallet:</strong> A physical device that stores your keys offline</li>
            <li><strong>Custodial Wallet:</strong> A wallet managed by a service (e.g., Dapper Wallet for Top Shot)</li>
          </ul>
          <div className="bg-brand-secondary p-3 rounded border border-brand-border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 For Vaultopolis:</h4>
            <p className="text-sm text-brand-text/70">You'll need a Flow Wallet to interact with Vaultopolis. This is different from your Dapper Wallet (used for Top Shot), though you can link them together.</p>
          </div>
        </div>
      )
    },
    {
      title: "What is an NFT?",
      content: (
        <div className="space-y-4">
          <p className="text-brand-text/80">
            NFT stands for "Non-Fungible Token." It's a unique digital asset that proves ownership of something specific. Think of it like a certificate of authenticity for a digital item.
          </p>
          <p className="text-brand-text/80">
            <strong>Key characteristics:</strong>
          </p>
          <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
            <li><strong>Unique:</strong> Each NFT is one-of-a-kind (or has a specific serial number)</li>
            <li><strong>Owned:</strong> You can prove you own it on the blockchain</li>
            <li><strong>Transferable:</strong> You can sell or trade it to others</li>
            <li><strong>Immutable:</strong> Ownership is recorded permanently on the blockchain</li>
          </ul>
          <div className="bg-brand-secondary p-3 rounded border border-brand-border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 NBA Top Shot Moments:</h4>
            <p className="text-sm text-brand-text/70">NBA Top Shot Moments are NFTs. Each Moment represents a specific play from an NBA game and has a unique serial number. For example, a LeBron James dunk from Game 7 might have 1000 copies, and yours might be serial #247.</p>
          </div>
        </div>
      )
    },
    {
      title: "What is a Fungible Token?",
      content: (
        <div className="space-y-4">
          <p className="text-brand-text/80">
            A <strong>fungible token</strong> is a digital asset that represents value or ownership. Unlike NFTs (Non-Fungible Tokens), fungible tokens are <strong>fungible</strong>—meaning each token is identical and interchangeable, like dollars or coins.
          </p>
          <p className="text-brand-text/80">
            <strong>Types of fungible tokens:</strong>
          </p>
          <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
            <li><strong>Currency Tokens:</strong> Like $FLOW—used as money on the blockchain</li>
            <li><strong>Utility Tokens:</strong> Like TSHOT—represent value and can be used for specific purposes</li>
            <li><strong>Governance Tokens:</strong> Give you voting rights in decentralized organizations</li>
          </ul>
          <div className="bg-brand-secondary p-3 rounded border border-brand-border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 TSHOT Token:</h4>
            <p className="text-sm text-brand-text/70">TSHOT is a fungible token that represents your NBA Top Shot Moments. When you deposit Moments into Vaultopolis, you receive TSHOT tokens. Each TSHOT token is backed 1:1 by Moments in the vault, so you can always redeem your TSHOT for Moments.</p>
          </div>
        </div>
      )
    },
    {
      title: "Flow Cadence vs Flow EVM",
      content: (
        <div className="space-y-4">
          <p className="text-brand-text/80">
            Flow blockchain has two different "sides" that work together:
          </p>
          <ul className="text-brand-text/80 space-y-3 list-none ml-4">
            <li>
              <strong>Flow Cadence (Native Flow):</strong> The original Flow blockchain side
              <ul className="text-brand-text/70 mt-2 space-y-1 list-disc list-inside ml-4">
                <li>Used for NBA Top Shot Moments and most NFTs</li>
                <li>Where you deposit/withdraw Moments and TSHOT</li>
                <li>Uses Flow Wallet for transactions</li>
                <li>Native Flow apps and smart contracts</li>
              </ul>
            </li>
            <li>
              <strong>Flow EVM (Ethereum Virtual Machine):</strong> The EVM-compatible side
              <ul className="text-brand-text/70 mt-2 space-y-1 list-disc list-inside ml-4">
                <li>Uses the same programming model as Ethereum (EVM-compatible)</li>
                <li>Where you can trade TSHOT on DEXs and participate in rewards programs</li>
                <li>Works with MetaMask and other EVM wallets</li>
                <li>Separate blockchain from Ethereum, but uses familiar tools</li>
              </ul>
            </li>
          </ul>
          <div className="bg-brand-secondary p-3 rounded border border-brand-border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 Why Two Sides?</h4>
            <p className="text-sm text-brand-text/70">Flow Cadence is optimized for NFTs and collectibles (like Top Shot). Flow EVM is a separate EVM-compatible blockchain that allows you to use familiar Ethereum tools and DeFi protocols. You can bridge TSHOT between them—deposit on Cadence, bridge to EVM for trading, then bridge back to redeem.</p>
          </div>
          <div className="bg-opolis/10 border-opolis/30 p-3 rounded border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 For Vaultopolis:</h4>
            <p className="text-sm text-brand-text/70">You'll primarily use Flow Cadence for depositing Moments and getting TSHOT. Then you can bridge TSHOT to Flow EVM to trade on DEXs or participate in rewards programs.</p>
          </div>
        </div>
      )
    },
    {
      title: "What are Gas Fees?",
      content: (
        <div className="space-y-4">
          <p className="text-brand-text/80">
            Gas fees are small payments you make to use the blockchain. Every transaction (like sending tokens, trading NFTs, or accepting a bounty) requires a tiny fee to process.
          </p>
          <p className="text-brand-text/80">
            <strong>Why do gas fees exist?</strong>
          </p>
          <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
            <li><strong>Network Security:</strong> Prevents spam and abuse</li>
            <li><strong>Resource Costs:</strong> Pays for the computing power needed to process transactions</li>
            <li><strong>Incentives:</strong> Rewards the network validators who maintain the blockchain</li>
          </ul>
          <div className="bg-brand-secondary p-3 rounded border border-brand-border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 Flow Blockchain:</h4>
            <p className="text-sm text-brand-text/70">Gas fees on Flow are paid in $FLOW tokens. Flow is very efficient—$1 worth of FLOW can pay for many transactions. Currently, Flow Wallet is temporarily covering most transaction fees on Vaultopolis, so you may not need to pay gas fees yourself right now.</p>
          </div>
          <div className="bg-opolis/10 border-opolis/30 p-3 rounded border">
            <h4 className="font-semibold text-brand-accent mb-2">💡 Pro Tip:</h4>
            <p className="text-sm text-brand-text/70">Always keep a small amount of FLOW in your wallet for transaction fees, even if they're currently covered. You'll need it for storage capacity to hold your NFTs.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <Helmet>
        <title>Vaultopolis - DeFi Basics: Understanding Blockchain & Crypto</title>
        <meta name="description" content="Blockchain basics, wallets, NFTs, tokens, and gas fees explained. Understand Flow blockchain and how Vaultopolis works." />
        <meta name="keywords" content="blockchain basics, crypto basics, what is nft, what is token, what is wallet, gas fees, flow blockchain, defi basics" />
        
        {/* Open Graph */}
        <meta property="og:title" content="DeFi Basics - Understanding Blockchain & Crypto | Vaultopolis" />
        <meta property="og:description" content="Learn the fundamentals of blockchain technology, wallets, NFTs, tokens, and gas fees. Beginner-friendly guide to crypto and DeFi." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://vaultopolis.com/guides/defi-basics" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="DeFi Basics - Understanding Blockchain & Crypto | Vaultopolis" />
        <meta name="twitter:description" content="Learn the fundamentals of blockchain technology, wallets, NFTs, tokens, and gas fees." />
      </Helmet>

      <div className="w-full">
        {/* Breadcrumb Navigation */}
        <PageWrapper padding="sm">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li>
                <Link to="/guides" className="hover:text-opolis transition-colors flex items-center">
                  <BookOpen className="mr-1" size={14} />
                  Guides
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-white">DeFi Basics</span>
              </li>
            </ol>
          </nav>
        </PageWrapper>

        {/* Main Content */}
        <PageWrapper padding="md">
          <ContentPanel 
            title="DeFi Basics - Understanding Blockchain & Crypto" 
            subtitle="Blockchain basics, wallets, NFTs, fungible tokens, and gas fees explained. Understand Flow blockchain and how Vaultopolis works."
          >
            <div className="space-y-6">
              {/* Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topics.map((topic, index) => (
                  <Card key={index} variant="elevated" padding="md">
                    <h3 className="text-lg font-semibold text-brand-text mb-4">
                      {topic.title}
                    </h3>
                    <div className="text-brand-text/90">
                      {topic.content}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Putting It All Together */}
              <Card variant="elevated" padding="md" className="bg-opolis/10 border-opolis/30">
                <h3 className="text-lg font-semibold text-brand-text mb-4">
                  Putting It All Together
                </h3>
                <p className="text-brand-text/80 mb-4">
                  Now that you understand the basics, here's how it all works together in Vaultopolis:
                </p>
                <ol className="text-brand-text/80 space-y-3 list-decimal list-inside ml-4">
                  <li><strong>You own NFTs:</strong> NBA Top Shot Moments stored in your wallet on the Flow blockchain</li>
                  <li><strong>You deposit them:</strong> Send your Moments to Vaultopolis, which stores them in a secure vault</li>
                  <li><strong>You receive fungible tokens:</strong> Get TSHOT tokens in return, representing your deposited Moments</li>
                  <li><strong>You can trade:</strong> Use TSHOT tokens on decentralized exchanges (DEXs) or in DeFi applications</li>
                  <li><strong>You can redeem:</strong> Burn TSHOT tokens to get random Moments back from the vault</li>
                </ol>
                <div className="bg-brand-secondary p-3 rounded border border-brand-border mt-4">
                  <h4 className="font-semibold text-brand-accent mb-2">💡 Ready to Get Started?</h4>
                  <p className="text-sm text-brand-text/70 mb-3">Now that you understand the basics, you're ready to start using Vaultopolis! Check out our Quick Start Guide to begin.</p>
                  <Link to="/guides/quick-start" className="text-brand-accent hover:underline text-sm font-medium inline-flex items-center gap-1">
                    Quick Start Guide →
                  </Link>
                </div>
              </Card>

              {/* FAQ Section */}
              <Card variant="secondary" padding="lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-brand-text">
                    Frequently Asked Questions
                  </h3>
                </div>
                <div className="space-y-3">
                  <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                    <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                      Do I need to understand all of this to use Vaultopolis?
                      <span className="text-opolis group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-white/80 leading-relaxed text-sm">
                        Not necessarily! You can follow our step-by-step guides without deep technical knowledge. However, understanding these basics will help you make informed decisions and troubleshoot any issues.
                      </p>
                    </div>
                  </details>
                  <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                    <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                      Is blockchain technology secure?
                      <span className="text-opolis group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-white/80 leading-relaxed text-sm">
                        Yes, blockchain is very secure due to cryptography and decentralization. However, you're responsible for keeping your wallet private keys secure. Never share them with anyone, and be cautious of phishing attempts.
                      </p>
                    </div>
                  </details>
                  <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                    <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                      What's the difference between an NFT and a fungible token?
                      <span className="text-opolis group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-white/80 leading-relaxed text-sm">
                        An NFT (Non-Fungible Token) is unique and one-of-a-kind, like a specific NBA Top Shot Moment with serial #247. A fungible token (like TSHOT) is identical and interchangeable—all tokens of the same type are the same, like dollars or coins.
                      </p>
                    </div>
                  </details>
                  <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                    <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                      Do I need FLOW tokens to use Vaultopolis?
                      <span className="text-opolis group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-white/80 leading-relaxed text-sm">
                        Currently, Flow Wallet is temporarily covering most transaction fees, so you may not need FLOW right now. However, you'll need FLOW for storage capacity (to hold NFTs in your wallet) and for when the fee sponsorship ends.
                      </p>
                    </div>
                  </details>
                  <details className="group bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200">
                    <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between p-4">
                      Can I lose my NFTs or tokens?
                      <span className="text-opolis group-open:rotate-180 transition-transform duration-200">▼</span>
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-white/80 leading-relaxed text-sm">
                        If you keep your private keys secure and use reputable wallets, your assets are safe. However, if you lose your private keys or share them with someone, you could lose access to your wallet permanently. Always backup your wallet and never share your keys.
                      </p>
                    </div>
                  </details>
                </div>
              </Card>

              {/* Related Guides */}
              <div className="pt-4 border-t border-brand-border">
                <h3 className="font-semibold text-brand-text mb-3">
                  Related Guides
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link to="/guides/quick-start">
                    <Button variant="secondary" size="md">
                      Quick Start Guide
                    </Button>
                  </Link>
                  <Link to="/guides/what-is-tshot">
                    <Button variant="secondary" size="md">
                      What is TSHOT?
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ContentPanel>
        </PageWrapper>
      </div>
    </>
  );
}

export default DeFiBasicsGuide;
