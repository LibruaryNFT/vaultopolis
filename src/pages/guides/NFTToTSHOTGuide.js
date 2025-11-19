import React from "react";
import { FaExchangeAlt } from "react-icons/fa";
import GuideTemplate from "../../components/GuideTemplate";

function NFTToTSHOTGuide() {
  const guideData = {
    title: "Swap NFT for TSHOT - Complete Guide",
    description: "Convert your NBA Top Shot Moments into TSHOT tokens using Vaultopolis. Step-by-step instructions for secure NFT tokenization with 1:1 collateralization.",
    keywords: "nft to tshot swap, vaultopolis swap guide, nba top shot tokenization, flow wallet swap tutorial, tshot token minting, nft liquidity protocol",
    canonicalUrl: "https://vaultopolis.com/guides/nft-to-tshot",
    ogTitle: "Swap NFT for TSHOT - Complete Vaultopolis Guide | NBA Top Shot Tokenization",
    ogDescription: "Learn how to swap your NBA Top Shot Moments for TSHOT tokens using Vaultopolis. Complete step-by-step guide with troubleshooting tips.",
    icon: FaExchangeAlt,
    difficulty: "Beginner",
    estimatedTime: "3-5 minutes",
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
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">3.</span>
            <span className="text-brand-text/80">NBA Top Shot Moments</span>
            <span className="text-brand-text/60">- You need Moments in your collection to swap</span>
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
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 Pro Tip:</h4>
              <p className="text-sm text-brand-text/70">Make sure your Flow Wallet is unlocked and ready before starting the connection process.</p>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot1.png" 
                alt="Connect wallet button in Vaultopolis interface" 
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
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">⚠️ Important Note:</h4>
              <p className="text-sm text-brand-text/70">We exclude serials under 4000 by default for additional safety, but you can deselect that filter if needed. Higher serial numbers generally provide better value.</p>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot2.png" 
                alt="Account selection and moment selection screen with filters" 
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
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">🔍 Review Checklist:</h4>
              <ul className="text-sm text-brand-text/70 space-y-1">
                <li>• Verify the correct Moments are selected</li>
                <li>• Check the TSHOT amount you'll receive</li>
                <li>• Ensure your Flow Wallet has enough FLOW for gas fees</li>
              </ul>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot3.png" 
                alt="Swap confirmation screen with selected moments and TSHOT amount" 
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
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">🔒 Security Check:</h4>
              <p className="text-sm text-brand-text/70">Always verify the transaction details in your wallet before approving. Look for the correct contract address and transaction amount.</p>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot4.png" 
                alt="Flow Wallet approval transaction popup with security details" 
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
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">🎉 What's Next:</h4>
              <ul className="text-sm text-brand-text/70 space-y-1">
                <li>• Use TSHOT for liquidity provision on DEXs</li>
                <li>• Enter wagering contests on partner platforms</li>
                <li>• Swap back for random Moments anytime</li>
              </ul>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/nft-to-tshot5.png" 
                alt="Successful swap completion screen with TSHOT balance" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      }
    ],
    successMessage: (
      <>
        <strong>Congratulations! 🎉</strong> You've successfully converted your NBA Top Shot Moments into TSHOT tokens. 
        Your tokens are now in your Flow Wallet and ready for use in the broader Vaultopolis ecosystem.
      </>
    ),
    // FAQ Section for SEO
    faq: [
      {
        question: "What is TSHOT and why should I swap my Moments for it?",
        answer: "TSHOT is a tokenized representation of NBA Top Shot Moments that provides liquidity and utility. By swapping, you can earn passive income through liquidity provision, enter wagering contests, and maintain the ability to swap back for random Moments anytime."
      },
      {
        question: "Is the swap reversible? Can I get my original Moments back?",
        answer: "While you can swap TSHOT back for NBA Top Shot Moments, this is not a true reversal. You'll receive random Moments from the vault, not your original ones. The protocol is designed for liquidity, not individual Moment preservation. Think of it as trading your specific Moments for a pool of Moments that maintains the same total value."
      },
      {
        question: "What are the gas fees for swapping?",
        answer: "Gas fees are paid in FLOW tokens and are typically very low on the Flow blockchain (usually less than $0.01). The exact cost depends on network congestion and transaction complexity."
      },
      {
        question: "Are there any risks involved in swapping?",
        answer: "The main risk is that you won't get your exact Moments back when redeeming. The protocol is secure and built on Flow's blockchain, but always ensure you're using the official Vaultopolis platform and verify transaction details in your wallet."
      },
      {
        question: "Can I swap multiple Moments at once?",
        answer: "Yes! You can select multiple Moments in a single transaction to swap them all for TSHOT at once. This is more gas-efficient than swapping them individually."
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default NFTToTSHOTGuide; 