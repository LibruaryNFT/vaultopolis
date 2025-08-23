import React from "react";
import { BookOpen, ArrowRight, CheckCircle, ExternalLink } from "lucide-react";

const QuickStartGuide = ({ variant = "full" }) => {
  const StepItem = ({ number, title, description, guideLink, guideText, externalLink, externalText, isOptional = false }) => (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
          {title}
          {isOptional && (
            <span className="text-xs bg-brand-primary/50 text-brand-text/70 px-2 py-1 rounded-full">
              Optional
            </span>
          )}
        </h3>
        <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {guideLink && (
            <a
              href={guideLink}
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              <BookOpen className="w-4 h-4" />
              {guideText}
            </a>
          )}
          {externalLink && (
            <a
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-primary/50 hover:bg-brand-primary/70 text-brand-text/80 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border border-brand-border hover:border-brand-accent/50"
            >
              <ExternalLink className="w-4 h-4" />
              {externalText}
            </a>
          )}
        </div>
      </div>
    </div>
  );

  const steps = [
    {
      number: 1,
      title: "Get a Flow Wallet (Required)",
      description: "You need a self-custody Flow wallet like Lilico or Blocto to interact with Vaultopolis and trade on DEXs. This is the essential first step.",
      guideLink: "/guides/flow-wallet",
      guideText: "Follow the guide: Make a Flow Wallet",
      externalLink: null,
      externalText: null,
      isOptional: false
    },
    {
      number: 2,
      title: "Get a Dapper Wallet (Optional)",
      description: "If you want to use your existing NBA Top Shot Moments, you'll need a Dapper Wallet. This automatically comes with your Top Shot account.",
      guideLink: "/guides/dapper-wallet",
      guideText: "Follow the guide: Make an NBA Top Shot Account & Dapper Wallet",
      externalLink: null,
      externalText: null,
      isOptional: true
    },
    {
      number: 3,
      title: "Link Your Wallets (Optional)",
      description: "If you have both wallets, link them so Vaultopolis can see your Top Shot Moments. This enables the Moments-to-TSHOT path.",
      guideLink: "/guides/account-linking",
      guideText: "Follow the guide: Account Linking",
      externalLink: null,
      externalText: null,
      isOptional: true
    },
    {
      number: 4,
      title: "Get TSHOT: NFT for TSHOT or Buy with FLOW",
      description: "You can either deposit Top Shot Moments to mint TSHOT (if you have linked wallets) or buy TSHOT directly with FLOW on a DEX.",
      guideLink: "/guides/nft-to-tshot",
      guideText: "NFT to TSHOT Guide",
      externalLink: "https://app.increment.fi/swap?in=A.1654653399040a61.FlowToken&out=A.05b67ba314000b2d.TSHOT",
      externalText: "Buy TSHOT on Increment.fi",
      isOptional: false
    },
    {
      number: 5,
      title: "Use TSHOT: Swap for Random Moments",
      description: "Use your TSHOT to hunt for new gems by swapping it back for random Moments from the vault.",
      guideLink: "/guides/tshot-to-nft",
      guideText: "Follow the guide: Swapping TSHOT for NFT",
      externalLink: null,
      externalText: null,
      isOptional: true
    }
  ];

  if (variant === "compact") {
    return (
      <div className="bg-brand-primary/20 border border-brand-border rounded-lg p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-accent" />
            Quick Start: From Zero to TSHOT
          </h2>
          <p className="text-sm text-brand-text/80">
            Get up and running with TSHOT in just a few steps
          </p>
        </div>
        <div className="space-y-3">
          {steps.filter(step => step.guideLink || step.externalLink).slice(0, 4).map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-brand-accent flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-brand-text">{step.title}</h3>
                {step.guideLink && (
                  <a
                    href={step.guideLink}
                    className="text-xs text-brand-accent hover:text-brand-accent/80 transition-colors"
                  >
                    View Guide →
                  </a>
                )}
                {step.externalLink && (
                  <a
                    href={step.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-accent hover:text-brand-accent/80 transition-colors"
                  >
                    Visit Site →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <a
            href="/guides"
            className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            View Full Quick Start Guide
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-brand-border rounded-xl p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/20 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-brand-accent" />
        </div>
        <h2 className="text-2xl font-bold text-brand-text mb-2">
          Quick Start: From Zero to TSHOT
        </h2>
        <p className="text-brand-text/80 max-w-2xl mx-auto">
          Welcome to Vaultopolis! This guide provides a simple 5-step path for new users to get their first TSHOT tokens. 
          We'll start with the essential Flow wallet setup, then show you optional steps for Top Shot integration, 
          and finally guide you through getting and using TSHOT. Just follow the steps below.
        </p>
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <StepItem key={index} {...step} />
        ))}
      </div>

      <div className="mt-8 p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-lg">
        <h3 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-brand-accent" />
          You're All Set!
        </h3>
        <p className="text-sm text-brand-text/80">
          You now have everything you need to start using TSHOT. Whether you're depositing Moments, 
          trading on DEXs, or redeeming for new gems, you're ready to explore the full potential of 
          tokenized Top Shot liquidity on the Flow blockchain.
        </p>
      </div>
    </div>
  );
};

export default QuickStartGuide; 