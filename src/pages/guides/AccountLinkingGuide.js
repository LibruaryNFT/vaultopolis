import React from "react";
import { FaLink } from "react-icons/fa";
import GuideTemplate from "../../components/GuideTemplate";

function AccountLinkingGuide() {
  const guideData = {
    title: "Account Linking",
    description: "Connect your Dapper account with external wallets to enable enhanced NFT functionality and self-custody options",
    keywords: "dapper account linking, external wallet connection, nft self-custody, flow wallet, blocto, nufi",
    canonicalUrl: "https://vaultopolis.com/guides/account-linking",
    ogTitle: "Account Linking | Dapper Wallet Guides",
    ogDescription: "Learn how to link your Dapper account with external wallets for enhanced NFT functionality.",
    icon: FaLink,
    difficulty: "Intermediate",
    estimatedTime: "2-3 minutes",
    lastUpdated: "August 19, 2025",
    prerequisites: (
      <div className="space-y-3">
        <p className="text-center mb-4">
          Before you can link accounts, you need to have both wallets set up and ready:
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">1.</span>
            <a 
              href="/guides/dapper-wallet" 
              className="text-brand-accent hover:underline font-medium"
            >
              Dapper Wallet Setup
            </a>
            <span className="text-brand-text/60">- Create and configure your Dapper account</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">2.</span>
            <a 
              href="/guides/flow-wallet" 
              className="text-brand-accent hover:underline font-medium"
            >
              Flow Wallet Setup
            </a>
            <span className="text-brand-text/60">- Set up your Flow wallet for external connections</span>
          </div>
        </div>
      </div>
    ),
    steps: [
      {
        id: 1,
        title: "Sign In to Dapper Wallet",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Go to <a href="https://accounts.meetdapper.com/" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">accounts.meetdapper.com</a> and sign in to your Dapper Wallet account.
            </p>
          </div>
        )
      },
      {
        id: 2,
        title: "Navigate to Account Linking",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Select the "Account Linking" tab from the left-hand sidebar in your Dapper Wallet interface.
            </p>
            <img 
              src="https://storage.googleapis.com/vaultopolis/guides/linking1.png" 
              alt="Account Linking tab in Dapper Wallet sidebar" 
              className="w-full rounded-lg border border-brand-border"
            />
          </div>
        )
      },
      {
        id: 3,
        title: "Link Flow Wallet",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Click "Link a New Wallet" and select <strong>Flow Wallet</strong> from the available options.
            </p>
            <img 
              src="https://storage.googleapis.com/vaultopolis/guides/linking2.png" 
              alt="Flow Wallet selection screen" 
              className="w-full rounded-lg border border-brand-border"
            />
          </div>
        )
      },
      {
        id: 4,
        title: "Select Collections to Link",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Choose whether to link all collections or select specific ones. <strong>We recommend linking all collections</strong> for the best experience.
            </p>
            <img 
              src="https://storage.googleapis.com/vaultopolis/guides/linking3.png" 
              alt="Collection selection screen - choose all or specific collections" 
              className="w-full rounded-lg border border-brand-border"
            />
          </div>
        )
      },
      {
        id: 5,
        title: "Confirm and Allow",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Review the linking details and click "Allow" to confirm the account linking process.
            </p>
            <img 
              src="https://storage.googleapis.com/vaultopolis/guides/linking4.png" 
              alt="Confirmation screen - click Allow to proceed" 
              className="w-full rounded-lg border border-brand-border"
            />
          </div>
        )
      },
      {
        id: 6,
        title: "Complete Linking & Verify",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              The system will show "Publishing your Dapper account..." while processing the link. <strong>This step is mostly just waiting for the process to finish</strong> - it may take a moment. Once complete, check the "Linked Accounts" section to confirm your Flow Wallet is successfully connected and ready to use.
            </p>
            <div className="space-y-4">
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/linking5.png" 
                alt="Processing screen showing 'Publishing your Dapper account'" 
                className="w-full rounded-lg border border-brand-border"
              />
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/linking6.png" 
                alt="Final screen showing successfully linked Flow Wallet account" 
                className="w-full rounded-lg border border-brand-border"
              />
              <img 
                src="https://storage.googleapis.com/vaultopolis/guides/linking7.png" 
                alt="Additional verification screen for account linking" 
                className="w-full rounded-lg border border-brand-border"
              />
            </div>
          </div>
        )
      }
    ],
    officialDocs: [
      {
        title: "Official Account Linking Documentation",
        url: "https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default AccountLinkingGuide; 