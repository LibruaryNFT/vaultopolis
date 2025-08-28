import React from "react";
import GuideTemplate from "../../components/GuideTemplate";
import { BookOpen } from "lucide-react";

function QuickStartGuidePage() {
  // Guide data for GuideTemplate
  const guideData = {
    title: "Quick Start: From Zero to TSHOT",
    description: "Complete step-by-step guide to get your first TSHOT tokens. Covers wallet setup, account linking, and two paths to acquire TSHOT on the Flow blockchain.",
    keywords: "tshot quick start, vaultopolis guide, flow wallet setup, dapper wallet, nba top shot, tshot token guide, nft tokenization, flow blockchain tutorial",
    canonicalUrl: "https://vaultopolis.com/guides/quick-start",
    ogTitle: "Quick Start: From Zero to TSHOT | Vaultopolis",
    ogDescription: "Complete step-by-step guide to get your first TSHOT tokens. Covers wallet setup, account linking, and two paths to acquire TSHOT.",
    icon: BookOpen,
    difficulty: "Beginner",
    estimatedTime: "10-15 minutes",
    steps: [
      {
        id: 1,
        title: "Get a Flow Wallet (Required)",
        content: (
          <div>
            <p>You need the official Flow wallet to interact with Vaultopolis and trade on DEXs. This is the essential first step.</p>
            <div className="bg-brand-accent/10 border-l-4 border-brand-accent p-4 my-4 rounded-r-lg">
              <p className="text-brand-text font-semibold">Pro Tip:</p>
              <p className="text-brand-text/80 text-sm">The Flow wallet is your gateway to the entire Flow ecosystem. Make sure to secure your seed phrase and never share it with anyone.</p>
            </div>
            <div className="bg-brand-secondary p-4 my-4 rounded-lg">
              <p className="text-brand-text font-semibold">What's Next:</p>
              <p className="text-brand-text/80 text-sm">After setting up your Flow wallet, you'll be able to hold FLOW tokens and interact with Vaultopolis.</p>
            </div>
          </div>
        )
      },
      {
        id: 2,
        title: "Get a Dapper Wallet (Optional)",
        content: (
          <div>
            <p>If you want to use your existing NBA Top Shot Moments, you'll need a Dapper Wallet. This automatically comes with your Top Shot account.</p>
            <div className="bg-brand-primary/50 border-l-4 border-brand-text/30 p-4 my-4 rounded-r-lg">
              <p className="text-brand-text font-semibold">Important Note:</p>
              <p className="text-brand-text/80 text-sm">This step is optional but highly recommended if you want to tokenize your existing Top Shot Moments into TSHOT.</p>
            </div>
            <div className="bg-brand-secondary p-4 my-4 rounded-lg">
              <p className="text-brand-text font-semibold">What's Next:</p>
              <p className="text-brand-text/80 text-sm">With both wallets, you can link them to enable the Moments-to-TSHOT conversion path.</p>
            </div>
          </div>
        )
      },
      {
        id: 3,
        title: "Link Your Wallets (Optional)",
        content: (
          <div>
            <p>If you have both wallets, link them so Vaultopolis can see your Top Shot Moments. This enables the Moments-to-TSHOT path.</p>
            <div className="bg-brand-accent/10 border-l-4 border-brand-accent p-4 my-4 rounded-r-lg">
              <p className="text-brand-text font-semibold">Pro Tip:</p>
              <p className="text-brand-text/80 text-sm">Account linking creates a secure connection between your wallets without transferring ownership of your Moments.</p>
            </div>
            <div className="bg-brand-secondary p-4 my-4 rounded-lg">
              <p className="text-brand-text font-semibold">What's Next:</p>
              <p className="text-brand-text/80 text-sm">Once linked, you can see all your Top Shot Moments in the Vaultopolis interface.</p>
            </div>
          </div>
        )
      },
      {
        id: 4,
        title: "Get TSHOT: NFT for TSHOT or Buy with FLOW",
        content: (
          <div>
            <p>You can either deposit Top Shot Moments to mint TSHOT (if you have linked wallets) or buy TSHOT directly with FLOW on a DEX.</p>
            <div className="bg-brand-accent/10 border-l-4 border-brand-accent p-4 my-4 rounded-r-lg">
              <p className="text-brand-text font-semibold">Pro Tip:</p>
              <p className="text-brand-text/80 text-sm">Starting with FLOW is often easier for beginners. You can always add Moments later for the full experience.</p>
            </div>
            <div className="bg-brand-secondary p-4 my-4 rounded-lg">
              <p className="text-brand-text font-semibold">Review Checklist:</p>
              <ul className="text-brand-text/80 text-sm list-disc list-inside space-y-1">
                <li>Flow wallet is set up and funded with FLOW</li>
                <li>Dapper wallet is connected (optional)</li>
                <li>Accounts are linked (optional)</li>
                <li>Ready to make your first TSHOT purchase</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 5,
        title: "Use TSHOT: Swap for Random Moments",
        content: (
          <div>
            <p>Use your TSHOT to hunt for new gems by swapping it back for random Moments from the vault.</p>
            <div className="bg-brand-accent/10 border-l-4 border-brand-accent p-4 my-4 rounded-r-lg">
              <p className="text-brand-text font-semibold">Pro Tip:</p>
              <p className="text-brand-text/80 text-sm">This is where the fun begins! Each swap gives you a chance to discover rare or valuable Moments from the vault.</p>
            </div>
            <div className="bg-brand-secondary p-4 my-4 rounded-lg">
              <p className="text-brand-text font-semibold">Security Check:</p>
              <p className="text-brand-text/80 text-sm">Always verify you're on the official Vaultopolis interface before making any swaps. Check the URL and look for security indicators.</p>
            </div>
            <div className="bg-brand-accent/10 border-l-4 border-brand-accent p-4 my-4 rounded-r-lg">
              <p className="text-brand-text font-semibold">What's Next:</p>
              <p className="text-brand-text/80 text-sm">Congratulations! You're now part of the Vaultopolis ecosystem. Consider providing liquidity or exploring advanced features.</p>
            </div>
          </div>
        )
      }
    ],
    faq: [
      {
        question: "How long does the entire setup process take?",
        answer: "The complete setup typically takes 10-15 minutes for beginners. Wallet creation takes 2-3 minutes each, account linking is 3-5 minutes, and your first TSHOT purchase can be completed in under 5 minutes."
      },
      {
        question: "Do I need both wallets to get started?",
        answer: "No, you only need a Flow wallet to get started. The Dapper wallet and account linking are optional but recommended if you want to tokenize existing Top Shot Moments. You can always add these later."
      },
      {
        question: "What if I don't have any NBA Top Shot Moments?",
        answer: "No problem! You can start by buying TSHOT directly with FLOW on decentralized exchanges like Increment.fi. This gives you immediate access to the Vaultopolis ecosystem without needing existing Moments."
      },
      {
        question: "Is it safe to link my wallets?",
        answer: "Yes, account linking is completely safe. It creates a read-only connection that allows Vaultopolis to see your Moments without transferring ownership. Your Moments remain in your Dapper wallet at all times."
      },
      {
        question: "How much FLOW do I need to get started?",
        answer: "You'll need enough FLOW for gas fees (typically 0.001-0.01 FLOW) plus the amount you want to spend on TSHOT. We recommend starting with at least 0.1 FLOW for a smooth experience."
      },
      {
        question: "Can I reverse the process and get my Moments back?",
        answer: "While you can swap TSHOT back for Top Shot Moments, this is not a true reversal. You'll receive random Moments from the vault, not your original ones. The protocol is designed for liquidity, not individual Moment preservation."
      },
      {
        question: "What happens if something goes wrong during setup?",
        answer: "Don't worry! All steps can be retried safely. If you encounter issues, check our troubleshooting guides or reach out to our community. Failed transactions don't result in lost funds."
      },
      {
        question: "Is there a minimum amount of TSHOT I need to start with?",
        answer: "There's no strict minimum, but we recommend starting with at least 1 TSHOT to get a feel for the platform. You can always add more later as you become more comfortable with the system."
      }
    ]
  };

  return (
    <GuideTemplate {...guideData} />
  );
}

export default QuickStartGuidePage; 