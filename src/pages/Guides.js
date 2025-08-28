import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaWallet, FaExchangeAlt } from "react-icons/fa";
import { BookOpen } from "lucide-react";

function Guides() {
  const guides = [
    {
      id: "quick-start",
      title: "Quick Start: From Zero to TSHOT",
      description: "Complete step-by-step guide to get your first TSHOT tokens. Covers wallet setup, account linking, and two paths to acquire TSHOT.",
      icon: <BookOpen className="text-3xl text-brand-accent" />,
      difficulty: "Beginner",
      estimatedTime: "10-15 minutes",
      path: "/guides/quick-start",
      lastUpdated: "August 19, 2025"
    },
    {
      id: "nba-topshot-account",
      title: "Make an NBA Top Shot Account & Dapper Wallet",
      description: "Create your Top Shot account and automatically get a Dapper Wallet - it's that simple!",
      icon: <FaWallet className="text-3xl text-brand-accent" />,
      difficulty: "Beginner",
      estimatedTime: "2-3 minutes",
      path: "/guides/dapper-wallet",
      lastUpdated: "August 19, 2025"
    },
    {
      id: "flow-wallet",
      title: "Make a Flow Wallet",
      description: "Additional Flow wallet options, security best practices, Top Shot integration",
      icon: <FaWallet className="text-3xl text-brand-accent" />,
      difficulty: "Beginner",
      estimatedTime: "3-5 minutes",
      path: "/guides/flow-wallet",
      lastUpdated: "August 19, 2025"
    },
    {
      id: "account-linking",
      title: "Account Linking",
      description: "Connect Top Shot to Flow wallet, enable external trading, Vaultopolis access",
      icon: <FaWallet className="text-3xl text-brand-accent" />,
      difficulty: "Beginner",
      estimatedTime: "3-5 minutes",
      path: "/guides/account-linking",
      lastUpdated: "August 19, 2025"
    },
    {
      id: "nft-to-tshot",
      title: "Swapping NFT for TSHOT",
      description: "Vaultopolis swap process, benefits of tokenization, 1:1 collateralization. Prerequisites: Flow Wallet (required), Dapper Wallet + Account Linking (recommended)",
      icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
      difficulty: "Beginner",
      estimatedTime: "2-3 minutes",
      path: "/guides/nft-to-tshot",
      lastUpdated: "August 19, 2025"
    },
    {
      id: "tshot-to-nft",
      title: "Swapping TSHOT for NFT",
      description: "Redemption process, Moment selection caveats, vault mechanics. Prerequisites: Flow Wallet (required), Dapper Wallet + Account Linking (recommended)",
      icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
      difficulty: "Beginner",
      estimatedTime: "2-3 minutes",
      path: "/guides/tshot-to-nft",
      lastUpdated: "August 19, 2025"
    }
  ];

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Vaultopolis Guides",
    "description": "Complete step-by-step guides for the Vaultopolis ecosystem including NBA Top Shot account creation, Dapper Wallet setup, and TSHOT token swaps.",
    "url": "https://vaultopolis.com/guides",
    "numberOfItems": guides.length,
    "itemListElement": guides.map((guide, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "HowTo",
        "name": guide.title,
        "description": guide.description,
        "url": `https://vaultopolis.com${guide.path}`,
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "0"
        },
        "timeRequired": guide.estimatedTime,
        "difficultyLevel": guide.difficulty
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Guides - Vaultopolis | Complete Step-by-Step Tutorials</title>
        <meta name="description" content="Complete step-by-step guides for the Vaultopolis ecosystem. Learn how to create wallets, link accounts, and swap NBA Top Shot Moments for TSHOT tokens." />
        <meta name="keywords" content="Vaultopolis guides, TSHOT tutorial, NBA Top Shot guide, Flow wallet setup, Dapper wallet, account linking, NFT swapping" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Guides - Vaultopolis | Complete Step-by-Step Tutorials" />
        <meta property="og:description" content="Complete step-by-step guides for the Vaultopolis ecosystem. Learn how to create wallets, link accounts, and swap NBA Top Shot Moments for TSHOT tokens." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/guides" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Guides - Vaultopolis | Complete Step-by-Step Tutorials" />
        <meta name="twitter:description" content="Complete step-by-step guides for the Vaultopolis ecosystem. Learn how to create wallets, link accounts, and swap NBA Top Shot Moments for TSHOT tokens." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary">
        {/* Hero Section */}
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-brand-text mb-6">
              Complete Guides & Tutorials
            </h1>
            <p className="text-xl text-brand-text/80 max-w-3xl mx-auto leading-relaxed">
              Step-by-step tutorials to get you started with TSHOT, from wallet setup to your first swap. Everything you need to know about the Vaultopolis ecosystem.
            </p>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <div key={guide.id} className="group">
                {guide.path === "/guides/quick-start" ? (
                  // Featured Guide Card (Quick Start) - Now Clickable!
                  <Link
                    to={guide.path}
                    className="group block h-full"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-brand-accent to-brand-accent/80 rounded-xl p-6 border border-brand-accent/30 hover:border-brand-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-accent/30 group-hover:scale-[1.02] group-hover:-translate-y-1 h-full flex flex-col">
                      {/* Featured Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white text-brand-accent font-bold text-xs rounded-full">
                          FEATURED
                        </span>
                      </div>
                      
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Card Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon with enhanced background */}
                        <div className="flex justify-center mb-6">
                          <div className="bg-white/20 p-4 rounded-full border border-white/30 group-hover:bg-white/30 group-hover:border-white/50 transition-all duration-300">
                            {guide.icon}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-white transition-colors flex-shrink-0 select-none guide-title">
                          {guide.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-white/90 mb-6 text-sm leading-relaxed text-center flex-grow">
                          {guide.description}
                        </p>
                      
                        {/* Metadata with static styling */}
                        <div className="flex justify-between items-center mt-auto">
                          <span className="px-4 py-2 bg-white/20 text-white font-semibold rounded-full text-xs border border-white/30">
                            {guide.difficulty}
                          </span>
                          <span className="text-white/70 text-xs font-medium bg-white/20 px-3 py-2 rounded-full border border-white/30">
                            ⏱ {guide.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  // Regular Guide Card (Clickable)
                  <Link
                    to={guide.path}
                    className="group block h-full"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-brand-secondary to-brand-primary rounded-xl p-6 border border-brand-border hover:border-brand-accent transition-all duration-300 hover:shadow-2xl hover:shadow-brand-accent/30 group-hover:scale-[1.02] group-hover:-translate-y-1 h-full flex flex-col">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Card Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon with enhanced background */}
                        <div className="flex justify-center mb-6">
                          <div className="bg-brand-accent/10 p-4 rounded-full border border-brand-accent/20 group-hover:bg-brand-accent/20 group-hover:border-brand-accent/40 transition-all duration-300">
                            {guide.icon}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-brand-text mb-4 group-hover:text-brand-accent transition-colors flex-shrink-0 select-none guide-title">
                          {guide.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-brand-text/80 mb-6 text-sm leading-relaxed text-center flex-grow">
                          {guide.description}
                        </p>
                        
                        {/* Metadata with enhanced styling */}
                        <div className="flex justify-between items-center mt-auto">
                          <span className="px-4 py-2 bg-brand-accent/20 text-brand-accent font-semibold rounded-full text-xs border border-brand-accent/30 group-hover:bg-brand-accent/30 group-hover:border-brand-accent/50 transition-all duration-300">
                            {guide.difficulty}
                          </span>
                          <span className="text-brand-text/70 text-xs font-medium bg-brand-primary/50 px-3 py-2 rounded-full border border-brand-border">
                            ⏱ {guide.estimatedTime}
                          </span>
                        </div>
                        
                        {/* Last Updated Info */}
                        {guide.lastUpdated && guide.lastUpdated !== "Coming Soon" && (
                          <div className="text-center mt-3">
                            <span className="text-xs text-brand-text/50">
                              Last updated: {guide.lastUpdated}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Link Section - Moved closer to guides */}
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 rounded-2xl p-8 border border-brand-accent/20 text-center">
            <h2 className="text-3xl font-bold text-brand-text mb-4">
              Looking for a quick answer?
            </h2>
            <p className="text-xl text-brand-text/80 mb-6 max-w-2xl mx-auto">
              Check out our comprehensive FAQ for quick answers to common questions about TSHOT, wallet setup, and vault operations.
            </p>
            <Link 
              to="/guides/faq" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-white font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors text-lg"
            >
              View Frequently Asked Questions →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Guides; 