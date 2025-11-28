import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import TSHOTVault from "../../components/TSHOTVault";

function TSHOTVaultPage() {
  return (
    <>
      <Helmet>
        <title>TSHOT Vault | NBA Top Shot Moments Backing TSHOT | Vaultopolis</title>
        <meta
          name="description"
          content="Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens. Explore Common and Fandom Moments in the Vaultopolis vault."
        />
        <meta name="keywords" content="tshot vault, nba top shot moments, nft gallery, vaultopolis vault, tshot backing, nft collection" />
        <link rel="canonical" href="https://vaultopolis.com/vaults/tshot" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="TSHOT Vault | NBA Top Shot Moments Backing TSHOT" />
        <meta property="og:description" content="Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/vaults/tshot" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TSHOT Vault | NBA Top Shot Moments Backing TSHOT" />
        <meta name="twitter:description" content="Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for TSHOT Vault */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "TSHOT Vault Contents",
            "description": "Browse the complete collection of NBA Top Shot Moments backing TSHOT tokens",
            "url": "https://vaultopolis.com/vaults/tshot"
          })}
        </script>
      </Helmet>

      {/* TSHOT Vault Contents */}
      <div className="w-full pt-4">
        <div className="px-3 sm:px-4">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-6 border-b border-brand-border/30 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
                  TSHOT Vault Contents
                </h2>
                <p className="text-sm text-brand-text/70 mt-1">
                  1:1 Backed • Transparent • On-Chain
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-brand-text/80 leading-relaxed mb-3">
              This vault holds the NBA Top Shot digital collectibles that back TSHOT tokens. 
              Every TSHOT is 1:1 collateralized by a moment in this vault. Contents update in real time as users mint or redeem TSHOT.
            </p>
            <p className="text-sm text-brand-text/70">
              <Link 
                to="/tshot" 
                className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-accent/80 underline font-medium transition-colors"
              >
                Learn more about TSHOT →
              </Link>
            </p>
          </div>
        </div>
        
        <div className="w-full px-3 sm:px-4">
          <TSHOTVault />
        </div>
      </div>
    </>
  );
}

export default TSHOTVaultPage;
