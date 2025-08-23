import React from "react";
import { FaExchangeAlt } from "react-icons/fa";
import GuideTemplate from "../../components/GuideTemplate";

function TSHOTToNFTGuide() {
  const guideData = {
    title: "Swap TSHOT for NFT",
    description: "Convert your TSHOT tokens back into NBA Top Shot Moments using Vaultopolis",
    keywords: "tshot to nft swap, vaultopolis swap, tshot token redemption, flow wallet swap",
    canonicalUrl: "https://vaultopolis.com/guides/tshot-to-nft",
    ogTitle: "Swap TSHOT for NFT | Vaultopolis Guides",
    ogDescription: "Learn how to swap your TSHOT tokens back into NBA Top Shot Moments using Vaultopolis.",
    icon: FaExchangeAlt,
    difficulty: "Beginner",
    estimatedTime: "2-3 minutes",
    lastUpdated: "August 19, 2025",
    prerequisites: (
      <div className="space-y-3">
        <p className="text-center mb-4">
          Before you can swap TSHOT for NFTs, you need to have the following set up:
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">1.</span>
            <a 
              href="/guides/flow-wallet" 
              className="text-brand-accent hover:underline font-medium"
            >
              Flow Wallet Setup
            </a>
            <span className="text-brand-text/60">- Required for all swaps</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">2.</span>
            <a 
              href="/guides/account-linking" 
              className="text-brand-accent hover:underline font-medium"
            >
              Account Linking
            </a>
            <span className="text-brand-text/60">- Optional, but recommended for enhanced functionality</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">3.</span>
            <span className="text-brand-text/80">TSHOT Tokens</span>
            <span className="text-brand-text/60">- You need TSHOT tokens in your wallet to swap</span>
          </div>
        </div>
      </div>
    ),
    steps: [
      {
        id: 1,
        title: "Connect Your Flow Wallet",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Click "Connect Wallet" and approve the connection in your Flow Wallet popup. This establishes the secure connection needed for the swap process.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot1.png" 
                alt="Connect wallet button" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 2,
        title: "Switch to TSHOT to NFTs Mode",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Switch to the TSHOT to NFTs mode to begin the redemption process. This will allow you to convert your TSHOT tokens back into NBA Top Shot Moments.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft1.png" 
                alt="TSHOT to NFTs mode selection" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 3,
        title: "Enter TSHOT Amount and Initiate Swap",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Enter the amount of TSHOT tokens you'd like to swap back into NFTs. Once you've specified the amount, click the "(Step 1 of 2) Swap TSHOT for Moments" button and approve the transaction in your Flow Wallet.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft2.png" 
                alt="TSHOT amount input and Step 1 button" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 4,
        title: "Select Receiving Account and Complete Redemption",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Select the account where you want to receive your NBA Top Shot Moments. Then click the "(Step 2 of 2) Receive Random Moments" button and approve the second transaction in your Flow Wallet.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft3.png" 
                alt="Account selection and Step 2 button" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 5,
        title: "Redemption Complete!",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Congratulations! Your TSHOT tokens have been successfully redeemed for NBA Top Shot Moments. The NFTs are now back in your Flow wallet and ready to use.
            </p>
            <div className="text-center space-y-4">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft4.png" 
                alt="Successful redemption completion screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft5.png" 
                alt="Redemption success details" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default TSHOTToNFTGuide; 