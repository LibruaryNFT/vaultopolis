import React from "react";
import { FaExchangeAlt, FaWallet } from "react-icons/fa";
import GuideTemplate from "../../components/GuideTemplate";

function TSHOTToNFTGuide() {
  const guideData = {
    title: "Swap TSHOT for NFT - Complete Redemption Guide",
    description: "Convert your TSHOT tokens back into NBA Top Shot Moments using Vaultopolis. Step-by-step instructions for secure token redemption with vault mechanics.",
    keywords: "tshot to nft swap, vaultopolis redemption guide, tshot token redemption, flow wallet swap tutorial, nba top shot moments, tshot token burning",
    canonicalUrl: "https://vaultopolis.com/guides/tshot-to-nft",
    ogTitle: "Swap TSHOT for NFT - Complete Vaultopolis Redemption Guide",
    ogDescription: "Learn how to swap your TSHOT tokens back into NBA Top Shot Moments using Vaultopolis. Complete step-by-step guide with vault mechanics explained.",
    icon: FaExchangeAlt,
    difficulty: "Beginner",
    estimatedTime: "3-5 minutes",
    lastUpdated: "August 19, 2025",
    prerequisites: (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <FaWallet className="text-brand-accent" size={20} />
          <span className="text-brand-text/80">Flow Wallet Setup - Required for all swaps</span>
        </div>
        <div className="flex items-center gap-3">
          <FaWallet className="text-brand-accent" size={20} />
          <span className="text-brand-text/80">Account Linking - Optional, but recommended</span>
        </div>
        <div className="flex items-center gap-3">
          <FaWallet className="text-brand-accent" size={20} />
          <span className="text-brand-text/80">TSHOT Tokens in your wallet</span>
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
              Click "Connect Wallet" and approve the connection in your Flow Wallet popup. This establishes the secure connection needed for the redemption process.
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 Pro Tip:</h4>
              <p className="text-sm text-brand-text/70">Ensure your Flow Wallet has enough FLOW for gas fees before starting the redemption process.</p>
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
        title: "Switch to TSHOT to NFTs Mode",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Switch to the TSHOT to NFTs mode to begin the redemption process. This will allow you to convert your TSHOT tokens back into NBA Top Shot Moments.
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">⚠️ Important Note:</h4>
              <p className="text-sm text-brand-text/70">This is a two-step process. First you'll burn TSHOT for Moments, then you'll receive random Moments from the vault.</p>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft1.png" 
                alt="TSHOT to NFTs mode selection interface" 
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
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">🔍 Review Checklist:</h4>
              <ul className="text-sm text-brand-text/70 space-y-1">
                <li>• Verify the TSHOT amount you want to redeem</li>
                <li>• Check that you have enough TSHOT in your wallet</li>
                <li>• Ensure your Flow Wallet has FLOW for gas fees</li>
              </ul>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft2.png" 
                alt="TSHOT amount input and Step 1 button interface" 
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
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">🎯 Account Selection:</h4>
              <p className="text-sm text-brand-text/70">Choose the account where you want your Moments to appear. This can be your Dapper account if linked, or any other Flow account you control.</p>
            </div>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft3.png" 
                alt="Account selection and Step 2 button interface" 
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
              Congratulations! Your TSHOT tokens have been successfully redeemed for NBA Top Shot Moments. The NFTs are now in your selected account and ready for trading, collecting, or any other use you prefer.
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">🎉 What's Next:</h4>
              <ul className="text-sm text-brand-text/70 space-y-1">
                <li>• Check your Moments in the selected account</li>
                <li>• Trade or hold your newly acquired Moments</li>
                <li>• Consider swapping more Moments for TSHOT if needed</li>
              </ul>
            </div>
            <div className="text-center space-y-4">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft4.png" 
                alt="Successful redemption completion screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/tshot-to-nft5.png" 
                alt="Redemption success details and confirmation" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      }
    ],
    successMessage: (
      <>
        <strong>Redemption Complete! 🎉</strong> Your TSHOT tokens have been successfully converted back into NBA Top Shot Moments. 
        The Moments are now in your selected account and ready for trading, collecting, or any other use you prefer.
      </>
    ),
    // FAQ Section for SEO
    faq: [
      {
        question: "How does the TSHOT to NFT redemption process work?",
        answer: "The redemption process is a two-step operation: First, you burn TSHOT tokens to initiate the redemption, then you receive random NBA Top Shot Moments from the vault. This two-step process ensures security and maintains the protocol's liquidity."
      },
      {
        question: "Will I get my original Moments back when redeeming TSHOT?",
        answer: "No, you won't get your exact original Moments back. The protocol is designed to provide random Moments from the vault, which helps maintain liquidity and prevents gaming of the system. This is a key feature of the Vaultopolis protocol."
      },
      {
        question: "How long does the redemption process take?",
        answer: "The entire redemption process typically takes 3-5 minutes. Step 1 (burning TSHOT) is usually instant, while Step 2 (receiving Moments) may take a moment to process and distribute the random Moments from the vault."
      },
      {
        question: "Can I choose which Moments I receive?",
        answer: "No, the Moments you receive are randomly selected from the vault. This randomization is intentional and helps maintain the protocol's liquidity and fairness. You cannot select specific Moments or serial numbers."
      },
      {
        question: "Are there any fees for redeeming TSHOT?",
        answer: "The only fees are gas fees paid in FLOW tokens, which are typically very low on the Flow blockchain. There are no additional protocol fees for redemption - it's a 1:1 exchange of TSHOT for Moments."
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default TSHOTToNFTGuide; 