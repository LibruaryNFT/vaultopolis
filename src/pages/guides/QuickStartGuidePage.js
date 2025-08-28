import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen, ExternalLink } from "lucide-react";
import { FaHome } from "react-icons/fa";

function QuickStartGuidePage() {
  return (
    <>
      <Helmet>
        <title>Quick Start: From Zero to TSHOT - Vaultopolis</title>
        <meta name="description" content="Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT." />
        <meta name="keywords" content="tshot quick start, vaultopolis guide, flow wallet setup, dapper wallet, nba top shot, tshot token guide" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Quick Start: From Zero to TSHOT - Vaultopolis" />
        <meta property="og:description" content="Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://vaultopolis.com/guides/quick-start" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Quick Start: From Zero to TSHOT - Vaultopolis" />
        <meta name="twitter:description" content="Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary">
        {/* Header */}
        <div className="pt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Breadcrumb Navigation */}
            <nav className="max-w-4xl mx-auto px-4 pt-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-brand-text/70 mb-8">
                <li>
                  <Link to="/" className="hover:text-brand-accent transition-colors flex items-center">
                    <FaHome className="mr-1" size={14} />
                    Home
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link to="/guides" className="hover:text-brand-accent transition-colors">
                    Guides
                  </Link>
                </li>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="text-brand-text">Quick Start</span>
                </li>
              </ol>
            </nav>

            {/* Title and Description */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <BookOpen className="text-6xl text-brand-accent" />
              </div>
              <h1 className="text-5xl font-bold text-brand-text mb-6">
                Quick Start: From Zero to TSHOT
              </h1>
              <p className="text-xl text-brand-text/80 max-w-3xl mx-auto leading-relaxed">
                Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT.
              </p>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="bg-brand-primary rounded-xl p-8 border border-brand-border">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-text mb-2">
                    Get a Flow Wallet (Required)
                  </h3>
                  <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                    You need the official Flow wallet to interact with Vaultopolis and trade on DEXs. This is the essential first step.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/guides/flow-wallet" 
                      className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4" />
                      Follow the guide: Make a Flow Wallet
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-brand-primary rounded-xl p-8 border border-brand-border">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
                    Get a Dapper Wallet (Optional)
                    <span className="text-xs bg-brand-primary/50 text-brand-text/70 px-2 py-1 rounded-full">
                      Optional
                    </span>
                  </h3>
                  <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                    If you want to use your existing NBA Top Shot Moments, you'll need a Dapper Wallet. This automatically comes with your Top Shot account.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/guides/dapper-wallet" 
                      className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4" />
                      Follow the guide: Make an NBA Top Shot Account & Dapper Wallet
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-brand-primary rounded-xl p-8 border border-brand-border">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
                    Link Your Wallets (Optional)
                    <span className="text-xs bg-brand-primary/50 text-brand-text/70 px-2 py-1 rounded-full">
                      Optional
                    </span>
                  </h3>
                  <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                    If you have both wallets, link them so Vaultopolis can see your Top Shot Moments. This enables the Moments-to-TSHOT path.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/guides/account-linking" 
                      className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4" />
                      Follow the guide: Account Linking
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-brand-primary rounded-xl p-8 border border-brand-border">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-text mb-2">
                    Get TSHOT: NFT for TSHOT or Buy with FLOW
                  </h3>
                  <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                    You can either deposit Top Shot Moments to mint TSHOT (if you have linked wallets) or buy TSHOT directly with FLOW on a DEX.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/guides/nft-to-tshot" 
                      className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4" />
                      NFT to TSHOT Guide
                    </Link>
                    <a 
                      href="https://increment.fi" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-brand-primary/50 hover:bg-brand-primary/70 text-brand-text/80 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border border-brand-border hover:border-brand-accent/50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buy TSHOT on Increment.fi
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-brand-primary rounded-xl p-8 border border-brand-border">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
                    Use TSHOT: Swap for Random Moments
                    <span className="text-xs bg-brand-primary/50 text-brand-text/70 px-2 py-1 rounded-full">
                      Optional
                    </span>
                  </h3>
                  <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                    Use your TSHOT to hunt for new gems by swapping it back for random Moments from the vault.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link 
                      to="/guides/tshot-to-nft" 
                      className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent/80 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    >
                      <BookOpen className="w-4 h-4" />
                      Follow the guide: Swapping TSHOT for NFT
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* You're All Set Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 rounded-2xl p-8 border border-brand-accent/20">
              <h2 className="text-3xl font-bold text-brand-text mb-6">
                You're All Set!
              </h2>
              <p className="text-xl text-brand-text/80 max-w-3xl mx-auto leading-relaxed">
                You now have everything you need to start using TSHOT. Whether you're depositing Moments, trading on DEXs, or redeeming for new gems, you're ready to explore the full potential of tokenized Top Shot liquidity on the Flow blockchain.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-brand-secondary border-t border-brand-border">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center text-brand-text/70">
              <p className="mb-4">
                Vaultopolis is a decentralized platform that tokenizes Top Shot Moments into TSHOT, enabling instant bulk trading, yield opportunities, and seamless liquidity management.
              </p>
              <p className="text-sm">
                Vaultopolis is not affiliated with Top Shot or Dapper Labs. All operations are executed through decentralized smart contracts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuickStartGuidePage; 