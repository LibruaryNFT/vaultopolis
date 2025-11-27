import React from "react";
import { Trophy } from "lucide-react";
import GuideTemplate from "../../components/GuideTemplate";

function BountiesGuide() {
  const guideData = {
    title: "Grail Bounties - Complete Guide",
    description: "Learn how to participate in Vaultopolis Grail Bounties. Accept offers for high-end NBA Top Shot Moments and earn rewards. Complete guide to matching moments and claiming bounties.",
    keywords: "grail bounties, nba top shot bounties, accept offers, high-end moments, vaultopolis bounties",
    canonicalUrl: "https://vaultopolis.com/guides/bounties",
    ogTitle: "Grail Bounties - Complete Guide | Vaultopolis",
    ogDescription: "Complete guide to participating in Vaultopolis Grail Bounties. Learn how to accept offers for high-end NBA Top Shot Moments.",
    icon: Trophy,
    difficulty: "Beginner",
    estimatedTime: "5-10 minutes",
    lastUpdated: "January 2025",
    prerequisites: (
      <div className="space-y-3">
        <p className="text-center mb-4">
          Before you can participate in Grail Bounties, you need to have the following set up:
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
            <span className="text-brand-text/60">- Required for accepting offers</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">2.</span>
            <a 
              href="/guides/account-linking" 
              className="text-brand-accent hover:underline font-medium"
            >
              Account Linking
            </a>
            <span className="text-brand-text/60">- Optional, but recommended for child accounts</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-brand-accent font-semibold">3.</span>
            <span className="text-brand-text/80">NBA Top Shot Moments</span>
            <span className="text-brand-text/60">- You need matching Moments in your collection</span>
          </div>
        </div>
      </div>
    ),
    steps: [
      {
        id: 1,
        title: "Navigate to Bounties Page",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Go to the Bounties page in Vaultopolis to view available Grail Bounties for NBA Top Shot Moments.
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 What are Grail Bounties?</h4>
              <p className="text-sm text-brand-text/70">Grail Bounties are offers from the Vaultopolis treasury for high-end Moments. When you accept a bounty, you trade your matching Moment for FLOW tokens at a premium price.</p>
            </div>
          </div>
        )
      },
      {
        id: 2,
        title: "Review Active Grail Bounties",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              The "Active Grail Bounties" section shows all available offers. Each bounty card displays:
            </p>
            <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
              <li>Moment details (player name, set, series, tier)</li>
              <li>Offer price in FLOW (and USD equivalent)</li>
              <li>Serial number requirements</li>
              <li>Matching moments count (if you own any)</li>
            </ul>
          </div>
        )
      },
      {
        id: 3,
        title: "Check Your Matching Moments",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Scroll down to the "Your Matching Moments" section to see which Moments in your collection match available bounties. This section shows:
            </p>
            <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
              <li>Moments you own that match active bounties</li>
              <li>Locked status indicator (if applicable)</li>
              <li>Offer price for each matching Moment</li>
            </ul>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">⚠️ Important Note:</h4>
              <p className="text-sm text-brand-text/70">Locked moments are shown with a lock icon. Locked moments cannot be sold until they are unlocked, so you cannot accept bounties for locked moments.</p>
            </div>
          </div>
        )
      },
      {
        id: 4,
        title: "Select Account and Review Overview",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Use the account selector to choose which account to check for matching moments. You can select from your parent account or any linked child accounts.
            </p>
            <p className="text-brand-text/80">
              The "Overview" section at the top shows:
            </p>
            <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
              <li>Total treasury grails acquired (for the selected collection type)</li>
              <li>Your matching moments count</li>
              <li>Total active bounties available</li>
            </ul>
          </div>
        )
      },
      {
        id: 5,
        title: "Accept a Bounty Offer",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              To accept a bounty:
            </p>
            <ol className="text-brand-text/80 space-y-2 list-decimal list-inside ml-4">
              <li>Find a bounty for a Moment you own in your collection</li>
              <li>Click the "Accept Offer" button on the bounty card or in your matching moments section</li>
              <li>Review the transaction details in the modal</li>
              <li>Approve the transaction in your Flow Wallet</li>
            </ol>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 Transaction Process:</h4>
              <p className="text-sm text-brand-text/70">The transaction will transfer your matching Moment to the treasury and send FLOW tokens to your wallet. You can monitor the status in the transaction modal.</p>
            </div>
          </div>
        )
      },
      {
        id: 6,
        title: "Refresh Your Collection",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              If you've recently acquired new Moments or want to check for updated matches, use the refresh button. This will:
            </p>
            <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
              <li>Reload your collection data</li>
              <li>Update matching moments counts</li>
              <li>Fetch the latest bounties</li>
            </ul>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 Pro Tip:</h4>
              <p className="text-sm text-brand-text/70">The refresh button will reload your collection data and update matching moments counts for the latest bounties.</p>
            </div>
          </div>
        )
      }
    ],
    faq: [
      {
        question: "Can I accept bounties for locked moments?",
        answer: "No, locked moments cannot be sold until they are unlocked. You can only accept bounties for unlocked moments."
      },
      {
        question: "How do I know if I have matching moments?",
        answer: "The 'Your Matching Moments' section shows all Moments in your collection that match active bounties. The matching is based on set ID, play ID, and serial number requirements."
      },
      {
        question: "What happens after I accept a bounty?",
        answer: "Your matching Moment is transferred to the Vaultopolis treasury, and you receive FLOW tokens at the offered price. The transaction is processed on the Flow blockchain."
      },
      {
        question: "Can I accept multiple bounties at once?",
        answer: "No, you need to accept each bounty individually. Each acceptance is a separate transaction that requires approval in your Flow Wallet."
      },
      {
        question: "Why don't I see any matching moments?",
        answer: "If you don't see matching moments, it means you don't currently own any Moments that match the active bounties. Check back later as new bounties are added regularly, or refresh your collection if you've recently acquired new Moments."
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default BountiesGuide;

