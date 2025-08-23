import React from "react";
import { FaWallet } from "react-icons/fa";
import GuideTemplate from "../../components/GuideTemplate";

function FlowWalletGuide() {
  const guideData = {
    title: "Create a Flow Wallet",
    description: "Set up your own Flow Wallet for secure, self-custodial access to the Flow blockchain ecosystem",
    keywords: "flow wallet setup, flow blockchain wallet, self-custodial wallet, flow ecosystem, wallet security, recovery phrase",
    canonicalUrl: "https://vaultopolis.com/guides/flow-wallet",
    ogTitle: "Create a Flow Wallet | Flow Blockchain Guides",
    ogDescription: "Learn how to create a secure Flow Wallet with step-by-step instructions for iOS, Android, and Chrome extension.",
    icon: FaWallet,
         difficulty: "Beginner",
    estimatedTime: "3-5 minutes",
    lastUpdated: "August 19, 2025",
    prerequisites: (
      <div className="space-y-3">
        <p className="text-center mb-4">
          Before creating a Flow Wallet, ensure you have:
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">1.</span>
            <span className="text-brand-text/60">A compatible device (iOS, Android, or Chrome browser)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">2.</span>
            <span className="text-brand-text/60">A secure location to store your recovery phrase</span>
          </div>
        </div>
      </div>
    ),
    steps: [
      {
        id: 1,
        title: "Download Flow Wallet",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Go to <a href="https://wallet.flow.com/download" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">wallet.flow.com/download</a> and choose your platform (iOS, Android, or Chrome Extension).
            </p>
            

          </div>
        )
      },
      {
        id: 2,
        title: "Create a New Account",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Launch the app and select "Create a new account".
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/flowwallet1.png" 
                alt="Create New Account Screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 3,
        title: "Choose Your Username",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Select a unique username (3-16 characters, letters, numbers, hyphens).
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/flowwallet2.png" 
                alt="Username Selection Screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 4,
        title: "Store Your Recovery Phrase",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Write down your 12-word recovery phrase in exact order. Use pen and paper, store securely.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/flowwallet3.png" 
                alt="Recovery Phrase Screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 5,
        title: "Confirm Your Recovery Phrase",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Select the words in your recovery phrase order to verify.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/flowwallet4.png" 
                alt="Recovery Phrase Confirmation Screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 6,
        title: "Create Your Password",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Set a strong password (8+ characters, mix of letters, numbers, symbols).
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/flowwallet5.png" 
                alt="Password Creation Screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 7,
        title: "Optional: Google Drive Backup",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Optionally enable Google Drive backup for additional security.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/flowwallet6.png" 
                alt="Google Drive Backup Option Screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
            </div>
          </div>
        )
      },
      {
        id: 8,
        title: "Launch Your Wallet!",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Your Flow Wallet is ready! You can now receive FLOW tokens, connect to dApps, and trade NFTs.
            </p>
            <div className="text-center">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/flowwallet7.png" 
                alt="Wallet Launch Screen" 
                className="w-full h-auto rounded-lg border border-brand-border mx-auto"
              />
              <h3 className="text-2xl font-bold text-brand-accent mb-2">You're All Set!</h3>
            </div>
          </div>
        )
      }
    ],
    
  };

  return <GuideTemplate {...guideData} />;
}

export default FlowWalletGuide; 