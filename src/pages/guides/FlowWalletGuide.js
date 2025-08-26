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
    faq: [
      {
        question: "How long does it take to set up a Flow wallet?",
        answer: "The entire setup process typically takes 3-5 minutes. This includes downloading the app, creating your wallet, writing down your recovery phrase, and setting up your password."
      },
      {
        question: "What if I lose my recovery phrase?",
        answer: "If you lose your recovery phrase, you'll lose access to your wallet permanently. There's no way to recover it. This is why it's crucial to write it down and store it securely in multiple safe locations."
      },
      {
        question: "Is Google Drive backup safe?",
        answer: "Google Drive backup adds an extra layer of security, but it's optional. If you enable it, make sure your Google account is also secured with 2FA. The backup is encrypted and only accessible with your wallet password."
      },
      {
        question: "Can I use the same wallet on multiple devices?",
        answer: "Yes, you can import your Flow wallet on multiple devices using your recovery phrase. This is useful for accessing your wallet from different devices while maintaining the same account."
      },
      {
        question: "What's the difference between Flow Wallet and Dapper Wallet?",
        answer: "Flow Wallet is a non-custodial wallet where you manage your own private keys and have full control over your assets. Dapper Wallet is a custodial wallet where Dapper Labs holds your private keys and manages your assets on your behalf. You can use both - Flow Wallet for general Flow interactions and Dapper for Top Shot Moments."
      },
      {
        question: "How do I get FLOW tokens to start?",
        answer: "You can purchase FLOW tokens from cryptocurrency exchanges like Coinbase, Binance, or Kraken, then transfer them to your Flow wallet. You'll need FLOW for gas fees and trading on Vaultopolis."
      },
      {
        question: "What if I forget my wallet password?",
        answer: "If you forget your password, you can reset it using your recovery phrase. This will restore access to your wallet, but you'll need to set a new password."
      },
      {
        question: "Is the Flow Wallet free to use?",
        answer: "Yes, the Flow Wallet app is completely free to download and use. You only pay for gas fees when making transactions on the Flow blockchain."
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default FlowWalletGuide; 