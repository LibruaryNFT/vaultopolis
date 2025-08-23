import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaWallet, FaExchangeAlt, FaCoins } from "react-icons/fa";
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
            path: "/guides/quick-start"
          },
          {
            id: "nba-topshot-account",
            title: "Make an NBA Top Shot Account & Dapper Wallet",
            description: "Create your Top Shot account and automatically get a Dapper Wallet - it's that simple!",
            icon: <FaWallet className="text-3xl text-brand-accent" />,
            difficulty: "Beginner",
            estimatedTime: "2-3 minutes",
            path: "/guides/dapper-wallet"
          },
      {
        id: "flow-wallet",
        title: "Make a Flow Wallet",
        description: "Additional Flow wallet options, security best practices, Top Shot integration",
        icon: <FaWallet className="text-3xl text-brand-accent" />,
        difficulty: "Beginner",
        estimatedTime: "3-5 minutes",
        path: "/guides/flow-wallet"
      },
     {
       id: "account-linking",
       title: "Account Linking",
       description: "Connect Top Shot to Flow wallet, enable external trading, Vaultopolis access",
       icon: <FaWallet className="text-3xl text-brand-accent" />,
       difficulty: "Beginner",
       estimatedTime: "3-5 minutes",
       path: "/guides/account-linking"
     },
     {
       id: "buying-nfts",
       title: "Buying NFTs",
       description: "Official Top Shot marketplace, Opensea, Flowty, price and authenticity considerations",
       icon: <FaWallet className="text-3xl text-brand-accent" />,
       difficulty: "Beginner",
       estimatedTime: "2-3 minutes",
       path: null,
       comingSoon: true
     },
     {
       id: "nft-to-tshot",
       title: "Swapping NFT for TSHOT",
       description: "Vaultopolis swap process, benefits of tokenization, 1:1 collateralization. Prerequisites: Flow Wallet (required), Dapper Wallet + Account Linking (recommended)",
       icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
       difficulty: "Beginner",
       estimatedTime: "2-3 minutes",
       path: "/guides/nft-to-tshot"
     },
     {
       id: "tshot-to-nft",
       title: "Swapping TSHOT for NFT",
       description: "Redemption process, Moment selection caveats, vault mechanics. Prerequisites: Flow Wallet (required), Dapper Wallet + Account Linking (recommended)",
       icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
       difficulty: "Beginner",
       estimatedTime: "2-3 minutes",
       path: "/guides/tshot-to-nft"
     },
     {
       id: "earning-rewards",
       title: "Earning Flow Rewards with TSHOT",
       description: "Staking rewards, liquidity mining, governance rights, maximizing returns",
       icon: <FaCoins className="text-3xl text-brand-accent" />,
       difficulty: "Intermediate",
       estimatedTime: "2-3 minutes",
       path: null,
       comingSoon: true
     },
     {
       id: "bridging-to-fevm",
       title: "Bridging NFTs to FEVM",
       description: "Cross-chain bridge process, Filecoin ecosystem benefits, gas fee considerations",
       icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
       difficulty: "Intermediate",
       estimatedTime: "2-3 minutes",
       path: null,
       comingSoon: true
     },
     {
       id: "bridging-from-fevm",
       title: "Bridging NFTs from FEVM to Cadence",
       description: "Return bridge process, Flow ecosystem benefits, Top Shot reintegration",
       icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
       difficulty: "Intermediate",
       estimatedTime: "2-3 minutes",
       path: null,
       comingSoon: true
     }
   ];

  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
                         <title>Guides | Vaultopolis</title>
        <meta
          name="description"
          content="Step-by-step guides for the Vaultopolis ecosystem including NBA Top Shot account creation and Dapper Wallet setup."
        />
        <meta name="keywords" content="vaultopolis guides, nba top shot account, dapper wallet setup, flow blockchain tutorial" />
        <link rel="canonical" href="https://vaultopolis.com/guides" />
        
                {/* Open Graph Tags */}
                  <meta property="og:title" content="Guides | Vaultopolis" />
          <meta property="og:description" content="Step-by-step guides for the Vaultopolis ecosystem including NBA Top Shot account creation and Dapper Wallet setup." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/guides" />
        
                {/* Twitter Card Tags */}
         <meta name="twitter:card" content="summary_large_image" />
                  <meta name="twitter:title" content="Guides | Vaultopolis" />
          <meta name="twitter:description" content="Step-by-step guides for the Vaultopolis ecosystem including NBA Top Shot account creation and Dapper Wallet setup." />
      </Helmet>

      {/* ─── PAGE BODY ─── */}
      <div className="w-full text-white space-y-6 mb-6">
        {/* Header Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4 pt-8">
          <div className="flex justify-center">
            <FaWallet className="text-6xl text-brand-accent" />
          </div>
          <h1 className="text-5xl font-bold text-brand-text">
            Guides
          </h1>
          <p className="text-xl text-brand-text/80 max-w-2xl mx-auto leading-relaxed">
            Step-by-step guides for the Vaultopolis ecosystem
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
                    <h3 className="text-xl font-bold text-brand-text mb-4 text-center flex-shrink-0">
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
                      <h3 className="text-xl font-bold text-brand-text mb-4 group-hover:text-brand-accent transition-colors text-center flex-shrink-0">
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