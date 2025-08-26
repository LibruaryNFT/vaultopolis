import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaWallet, FaExchangeAlt, FaHome } from "react-icons/fa";
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
     },

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
      {/* ─── SEO ─── */}
      <Helmet>
        <title>Vaultopolis Guides - Complete Tutorials for NBA Top Shot & TSHOT | Step-by-Step Instructions</title>
        <meta
          name="description"
          content="Master the Vaultopolis ecosystem with our comprehensive guides. Learn NBA Top Shot account setup, Dapper Wallet configuration, TSHOT token swaps, and Flow blockchain integration. Perfect for beginners and collectors."
        />
        <meta name="keywords" content="vaultopolis guides, nba top shot tutorial, dapper wallet setup, flow blockchain guide, tshot token swap, nft liquidity, vaultopolis tutorial, flow wallet setup" />
        <link rel="canonical" href="https://vaultopolis.com/guides" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Vaultopolis Guides - Complete Tutorials for NBA Top Shot & TSHOT" />
        <meta property="og:description" content="Master the Vaultopolis ecosystem with our comprehensive guides. Learn NBA Top Shot account setup, Dapper Wallet configuration, and TSHOT token swaps." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/guides" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Vaultopolis Guides - Complete Tutorials for NBA Top Shot & TSHOT" />
        <meta name="twitter:description" content="Master the Vaultopolis ecosystem with our comprehensive guides. Learn NBA Top Shot account setup, Dapper Wallet configuration, and TSHOT token swaps." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* ─── PAGE BODY ─── */}
      <div className="w-full text-white space-y-6 mb-6">
        {/* Breadcrumb Navigation */}
        <nav className="max-w-4xl mx-auto px-4 pt-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-brand-text/70">
            <li>
              <Link to="/" className="hover:text-brand-accent transition-colors flex items-center">
                <FaHome className="mr-1" size={14} />
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-brand-text">Guides</span>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4 pt-8">
          <div className="flex justify-center">
            <FaWallet className="text-6xl text-brand-accent" />
          </div>
          <h1 className="text-5xl font-bold text-brand-text">
            Vaultopolis Guides
          </h1>
          <p className="text-xl text-brand-text/80 max-w-2xl mx-auto leading-relaxed">
            Master the Vaultopolis ecosystem with our comprehensive step-by-step tutorials
          </p>
          <p className="text-sm text-brand-text/60">
            From beginner wallet setup to advanced TSHOT token swaps - everything you need to succeed
          </p>
        </div>



        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto px-4">
          {guides.map((guide, index) => (
            <div key={guide.id} className="block h-full">
                             {guide.comingSoon ? (
                 // Coming Soon Guide Card (Non-clickable)
                 <div className="relative overflow-hidden bg-gradient-to-br from-brand-secondary to-brand-primary rounded-xl p-6 border border-brand-border h-full flex flex-col">
                                       {/* Diagonal Coming Soon Banner */}
                    <div className="absolute inset-0 bg-black/40 z-20"></div>
                    <div className="absolute top-0 left-0 w-full h-full z-30">
                      <div className="bg-yellow-400 text-black text-center py-3 font-bold text-lg transform -rotate-12 translate-y-8 -translate-x-8 w-[120%] shadow-lg border-2 border-yellow-600">
                        COMING SOON
                      </div>
                    </div>
                   
                   {/* Card Content */}
                   <div className="relative z-10 flex flex-col h-full">
                    {/* Icon with static background */}
                    <div className="flex justify-center mb-6">
                      <div className="bg-brand-accent/10 p-4 rounded-full border border-brand-accent/20">
                        {guide.icon}
                      </div>
                    </div>
                    
                                          {/* Title */}
                      <h3 className="text-xl font-bold text-brand-text mb-4 flex-shrink-0 select-none guide-title">
                        {guide.title}
                      </h3>
                    
                    {/* Description */}
                    <p className="text-brand-text/80 mb-6 text-sm leading-relaxed text-center flex-grow">
                      {guide.description}
                    </p>
                    
                    {/* Metadata with static styling */}
                    <div className="flex justify-between items-center mt-auto">
                      <span className="px-4 py-2 bg-brand-accent/20 text-brand-accent font-semibold rounded-full text-xs border border-brand-accent/30">
                        {guide.difficulty}
                      </span>
                      <span className="text-brand-text/70 text-xs font-medium bg-brand-primary/50 px-3 py-2 rounded-full border border-brand-border">
                        ⏱ {guide.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
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
    </>
  );
}

export default Guides; 