import React from "react";
import { FaExchangeAlt } from "react-icons/fa";
import GuideTemplate from "../../components/GuideTemplate";

function NFTToTSHOTGuide() {
  const guideData = {
    title: "Swap NFT for TSHOT",
    description: "Convert your NBA Top Shot Moments into TSHOT tokens using Vaultopolis",
    keywords: "nft to tshot swap, vaultopolis swap, nba top shot tokenization, flow wallet swap",
    canonicalUrl: "https://vaultopolis.com/guides/nft-to-tshot",
    ogTitle: "Swap NFT for TSHOT | Vaultopolis Guides",
    ogDescription: "Learn how to swap your NBA Top Shot Moments for TSHOT tokens using Vaultopolis.",
    icon: FaExchangeAlt,
    difficulty: "Beginner",
    estimatedTime: "2-3 minutes",
    lastUpdated: "August 19, 2025",
    prerequisites: (
      <div className="space-y-3">
        <p className="text-center mb-4">
          Before you can swap NFTs for TSHOT, you need to have the following set up:
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
              title: "Choose NFTs from Your Collection",
              content: (
                <div className="space-y-4">
                  <p className="text-brand-text/80">
                    Choose the account you'd like to select from using the account selector. Then choose the NFTs you would like to swap for TSHOT.
                  </p>
                  <p className="text-brand-text/60 text-sm italic">
                    Note: Use the filters to help you search - we exclude serials under 4000 by default for additional safety, but you can deselect that filter if needed.
                  </p>
                  <div className="text-center">
                    <img 
                      src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot2.png" 
                      alt="Account selection and moment selection screen" 
                      className="w-full h-auto rounded-lg border border-brand-border mx-auto"
                    />
                  </div>
                </div>
              )
            },
            {
              id: 3,
              title: "Review and Initiate the Swap",
              content: (
                <div className="space-y-4">
                  <p className="text-brand-text/80">
                    Once you're happy with your selection, review the total TSHOT you'll receive. Click the "Swap" button to begin the transaction.
                  </p>
                  <div className="text-center">
                    <img 
                      src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot3.png" 
                      alt="Select a wallet screen" 
                      className="w-full h-auto rounded-lg border border-brand-border mx-auto"
                    />
                  </div>
                </div>
              )
            },
            {
              id: 4,
              title: "Approve the Transaction",
              content: (
                <div className="space-y-4">
                  <p className="text-brand-text/80">
                    Your Flow Wallet will pop up with the transaction details. Review them one last time and click "Approve" to confirm.
                  </p>
                  <div className="text-center">
                    <img 
                      src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot4.png" 
                      alt="Flow Wallet approval transaction popup" 
                      className="w-full h-auto rounded-lg border border-brand-border mx-auto"
                    />
                  </div>
                </div>
              )
            },
            {
              id: 5,
              title: "Swap Complete!",
              content: (
                <div className="space-y-4">
                  <p className="text-brand-text/80">
                    That's it! Your Flow Wallet now has TSHOT tokens representing the NFTs you swapped in. The swap is complete and your tokens are ready to use.
                  </p>
                  <div className="text-center">
                    <img 
                      src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot5.png" 
                      alt="Successful swap completion screen" 
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

export default NFTToTSHOTGuide; 