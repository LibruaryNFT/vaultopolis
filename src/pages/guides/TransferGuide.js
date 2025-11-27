import React from "react";
import { ArrowLeftRight } from "lucide-react";
import GuideTemplate from "../../components/GuideTemplate";

function TransferGuide() {
  const guideData = {
    title: "Transfer NFTs - Bulk Transfer Guide",
    description: "Learn how to transfer NBA Top Shot Moments between Flow accounts or bridge them to Flow EVM. Step-by-step instructions for bulk transfers up to 280 NFTs.",
    keywords: "transfer nfts, bulk transfer, flow wallet transfer, nba top shot transfer, bridge nfts to evm, flow blockchain transfer",
    canonicalUrl: "https://vaultopolis.com/guides/transfer",
    ogTitle: "Transfer NFTs - Bulk Transfer Guide | Vaultopolis",
    ogDescription: "Complete guide to transferring NBA Top Shot Moments between Flow accounts or bridging to Flow EVM. Support for bulk transfers up to 280 NFTs.",
    icon: ArrowLeftRight,
    difficulty: "Intermediate",
    estimatedTime: "5-10 minutes",
    lastUpdated: "January 2025",
    prerequisites: (
      <div className="space-y-3">
        <p className="text-center mb-4">
          Before you can transfer NFTs, you need to have the following set up:
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
            <span className="text-brand-text/60">- Required for all transfers</span>
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
            <span className="text-brand-text/60">- You need Moments in your collection to transfer</span>
          </div>
        </div>
      </div>
    ),
    steps: [
      {
        id: 1,
        title: "Navigate to Transfer Page",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Go to the Transfer page in Vaultopolis. You'll see two transfer options: "Flow → Flow" for transferring between Flow accounts, and "Flow → Flow EVM" for bridging NFTs to Flow EVM.
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 Transfer Limits:</h4>
              <ul className="text-sm text-brand-text/70 space-y-1 list-disc list-inside">
                <li>Flow → Flow: Up to 280 NFTs per transaction</li>
                <li>Flow → Flow EVM: Up to 9 NFTs per transaction</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 2,
        title: "Select Source Account",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Use the account selector at the top to choose which account you want to transfer from. You can select from your parent account or any linked child accounts.
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">⚠️ Important Note:</h4>
              <p className="text-sm text-brand-text/70">Locked moments are automatically excluded from the transfer tool. Only unlocked moments can be transferred.</p>
            </div>
          </div>
        )
      },
      {
        id: 3,
        title: "Select Moments to Transfer",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Browse your collection and select the Moments you want to transfer. You can use filters to find specific Moments by tier, series, set, or player. The transfer tool displays moments sorted by highest serial number first (descending order).
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 Pro Tip:</h4>
              <p className="text-sm text-brand-text/70">Selected moments will disappear from the display as you select them, making it easy to see what's left to choose.</p>
            </div>
          </div>
        )
      },
      {
        id: 4,
        title: "Choose Transfer Destination",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Select your transfer type:
            </p>
            <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
              <li><strong>Flow → Flow:</strong> Enter the recipient's Flow address (starts with 0x). You can transfer up to 280 NFTs in a single transaction.</li>
              <li><strong>Flow → Flow EVM:</strong> Your NFTs will be bridged to Flow EVM. Limited to 9 NFTs per transaction due to bridge constraints.</li>
            </ul>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">⚠️ Important:</h4>
              <p className="text-sm text-brand-text/70">For Flow → Flow transfers, make sure you have the correct recipient address. Double-check the address before confirming the transaction.</p>
            </div>
          </div>
        )
      },
      {
        id: 5,
        title: "Review and Confirm Transfer",
        content: (
          <div className="space-y-4">
            <p className="text-brand-text/80">
              Review your selection:
            </p>
            <ul className="text-brand-text/80 space-y-2 list-disc list-inside ml-4">
              <li>Number of NFTs selected</li>
              <li>Transfer destination (address or EVM)</li>
              <li>Source account</li>
            </ul>
            <p className="text-brand-text/80 mt-4">
              Click the transfer button to initiate the transaction. You'll need to approve the transaction in your Flow Wallet.
            </p>
            <div className="bg-brand-secondary p-3 rounded border border-brand-border">
              <h4 className="font-semibold text-brand-accent mb-2">💡 Transaction Process:</h4>
              <p className="text-sm text-brand-text/70">The transaction will be processed on the Flow blockchain. You can monitor the status in the transaction modal. Once complete, your NFTs will be transferred to the destination.</p>
            </div>
          </div>
        )
      }
    ],
    faq: [
      {
        question: "Why can I only transfer 9 NFTs to Flow EVM?",
        answer: "Flow EVM bridge has stricter transaction limits due to the cross-chain nature of the operation. For larger transfers, use Flow → Flow transfers instead."
      },
      {
        question: "Can I transfer locked moments?",
        answer: "No, locked moments are automatically excluded from the transfer tool. Only unlocked moments can be transferred."
      },
      {
        question: "What happens if my transaction fails?",
        answer: "If a transaction fails, your NFTs remain in your original account. The transaction will be reverted, and you can try again. Make sure you have sufficient FLOW for transaction fees."
      },
      {
        question: "Can I transfer from a child account?",
        answer: "Yes! You can transfer from any linked account, including child accounts. Just select the account you want to transfer from using the account selector."
      },
      {
        question: "How long does a transfer take?",
        answer: "Flow → Flow transfers typically complete within a few seconds to a minute. Flow EVM bridges may take slightly longer due to cross-chain processing."
      }
    ]
  };

  return <GuideTemplate {...guideData} />;
}

export default TransferGuide;

