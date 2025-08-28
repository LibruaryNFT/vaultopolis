import React, { useState } from "react";
import { Helmet } from "react-helmet-async";

import TSHOTAnalytics from "../components/TSHOTAnalytics";

function Analytics() {
  const [activeTab, setActiveTab] = useState("tshot");

  // Token configuration - easy to add new tokens here
  const tokens = [
    {
      id: "tshot",
      name: "TSHOT",
      label: "TSHOT",
      description: "NBA Top Shot Moments"
    }
    // Future tokens can be added here:
    // {
    //   id: "nfl-token",
    //   name: "NFL Token",
    //   label: "NFL",
    //   description: "NFL All Day Moments"
    // }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "tshot":
        return (
          <>
            {/* Analytics Only - Vault Contents moved to dedicated page */}
            <TSHOTAnalytics />
          </>
        );
      // Future cases for other tokens:
      // case "nfl-token":
      //   return (
      //     <>
      //       <NFLAnalytics />
      //       <div className="px-2 md:px-3">
      //         <div className="max-w-6xl mx-auto">
      //           <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden">
      //             <button
      //               onClick={() => setIsVaultExpanded(!isVaultExpanded)}
      //               className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-primary/80 transition-colors"
      //             >
      //               <div className="flex items-center gap-3">
      //                 <span className="text-xl">🔒</span>
      //                 <div>
      //                   <span className="font-semibold text-brand-text">Vault Contents</span>
      //                   <p className="text-sm text-brand-text/70">Browse the moments backing NFL Token</p>
      //                 </div>
      //               </div>
      //               <div className="flex items-center gap-2">
      //                 <span className="text-sm text-brand-text/70">
      //                   {isVaultExpanded ? 'Collapse' : 'Expand'}
      //               </span>
      //                 <span className={`text-lg transition-transform duration-200 ${
      //                   isVaultExpanded ? 'rotate-90' : '' 
      //                 }`}>
      //                   ▶
      //                 </span>
      //               </div>
      //             </button>
      //             
      //             {isVaultExpanded && (
      //               <div className="border-t border-brand-border">
      //                 <NFLVault />
      //               </div>
      //             )}
      //           </div>
      //         </div>
      //       </div>
      //     </>
      //   );
      default:
        return (
          <div className="text-center py-8 text-brand-text/70">
            <p>Select a token to view analytics</p>
          </div>
        );
    }
  };

  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
        <title>Analytics | TSHOT Vault Data & Token Statistics | Vaultopolis</title>
        <meta
          name="description"
          content="Comprehensive analytics and vault data for TSHOT token. View real-time vault contents, token statistics, price data, and detailed analytics on the Flow blockchain."
        />
        <meta name="keywords" content="tshot analytics, tshot vault data, tshot statistics, flow blockchain analytics, nba top shot vault, tshot token data" />
        <link rel="canonical" href="https://vaultopolis.com/analytics" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Analytics | TSHOT Vault Data & Token Statistics" />
        <meta property="og:description" content="Comprehensive analytics and vault data for TSHOT token. View real-time vault contents and detailed statistics." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/analytics" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Analytics | TSHOT Vault Data & Token Statistics" />
        <meta name="twitter:description" content="Comprehensive analytics and vault data for TSHOT token." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for Analytics Page */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "TSHOT Analytics",
            "description": "Comprehensive analytics and vault data for TSHOT token",
            "url": "https://vaultopolis.com/analytics"
          })}
        </script>
      </Helmet>

      {/* ─── PAGE BODY ─── */}
      <div className="w-full text-white space-y-2 mb-2">
        {/* Token Tabs */}
        <div className="px-2 md:px-3">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-1 bg-brand-primary rounded-lg p-1">
              {tokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => setActiveTab(token.id)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    ${activeTab === token.id
                      ? "bg-brand-secondary text-brand-text shadow-md"
                      : "text-brand-text/70 hover:text-brand-text hover:bg-brand-primary/50"
                    }
                  `}
                  title={token.description}
                >
                  <span className="hidden sm:inline">{token.name}</span>
                  <span className="sm:hidden">{token.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-2">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
}

export default Analytics;
