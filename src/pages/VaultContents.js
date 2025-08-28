import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import TSHOTVault from "../components/TSHOTVault";

function VaultContents() {
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
            {/* TSHOT Vault Contents */}
            <div className="px-2 md:px-3">
              <div className="max-w-6xl mx-auto">
                <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden">
                  <div className="p-4 border-b border-brand-border">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <span className="text-xl font-semibold text-brand-text">Vault Contents</span>
                        <p className="text-sm text-brand-text/70">Browse the moments backing TSHOT</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <TSHOTVault />
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      // Future cases for other tokens:
      // case "nfl-token":
      //   return (
      //     <>
      //       {/* NFL Token Vault Contents */}
      //       <div className="px-2 md:px-3">
      //         <div className="max-w-6xl mx-auto">
      //           <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden">
      //             <div className="p-4 border-b border-brand-border">
      //               <div className="flex items-center gap-3">
      //                 <span className="text-2xl">🔒</span>
      //                 <div>
      //                   <span className="text-xl font-semibold text-brand-text">Vault Contents</span>
      //                   <p className="text-sm text-brand-text/70">Browse the moments backing NFL Token</p>
      //                 </div>
      //               </div>
      //             </div>
      //             
      //             <div className="p-4">
      //               <NFLVault />
      //             </div>
      //           </div>
      //         </div>
      //       </div>
      //     </>
      //   );
      default:
        return (
          <div className="text-center py-8 text-brand-text/70">
            <p>Select a token to view vault contents</p>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Explore the Vault | TSHOT NFT Collection Gallery | Vaultopolis</title>
        <meta
          name="description"
          content="Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens. Explore Common and Fandom Moments in the Vaultopolis vault with advanced filtering and search."
        />
        <meta name="keywords" content="tshot vault, nba top shot moments, nft gallery, vaultopolis vault, tshot backing, nft collection" />
        <link rel="canonical" href="https://vaultopolis.com/vault-contents" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Explore the Vault | TSHOT NFT Collection Gallery" />
        <meta property="og:description" content="Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/vault-contents" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Explore the Vault | TSHOT NFT Collection Gallery" />
        <meta name="twitter:description" content="Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for Vault Contents Page */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "TSHOT Vault Contents",
            "description": "Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens",
            "url": "https://vaultopolis.com/vault-contents"
          })}
        </script>
      </Helmet>

      {/* Page Header */}
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-brand-text mb-6">
              Explore the Vault
            </h1>
            <p className="text-xl text-brand-text/80 max-w-3xl mx-auto leading-relaxed">
              Browse the complete collection of NBA Top Shot Moments that back TSHOT tokens. 
              Discover Common and Fandom Moments with advanced filtering and search capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Token Tabs */}
      <div className="px-2 md:px-3 mb-4">
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
    </>
  );
}

export default VaultContents; 