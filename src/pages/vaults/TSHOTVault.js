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

      {/* Vault Navigation */}
      <div className="w-full mt-4 mb-4">
        <div className="max-w-6xl mx-auto mx-2 sm:mx-4">
          <div className="flex items-center gap-2 bg-brand-primary rounded-lg p-2" role="tablist" aria-label="Vault sections">
            <Link
              to="/vaults/tshot"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-opolis text-opolis bg-brand-secondary"
            >
              <img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="hidden sm:inline text-sm sm:text-base">TSHOT</span>
              <span className="sm:hidden text-sm">TSHOT</span>
            </Link>
            <Link
              to="/vaults/topshotgrails"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-blue"
            >
              <span aria-hidden="true" className="text-3xl sm:text-4xl">🏛️</span>
              <span className="hidden sm:inline text-sm sm:text-base">TopShot Grails</span>
              <span className="sm:hidden text-sm">TS Grails</span>
            </Link>
            {/* AllDay Grails temporarily disabled */}
          </div>
        </div>
      </div>

      {/* TSHOT Vault Contents */}
      <div className="w-full">
        <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden">
          <div className="p-4 border-b border-brand-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-brand-text/70">Browse the moments backing TSHOT</p>
              </div>
              <a 
                href="/tshot" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white text-base font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
              >
                ℹ️ Learn About TSHOT
              </a>
            </div>
          </div>
          
          <div className="p-4">
            <TSHOTVault />
          </div>
        </div>
      </div>
    </>
  );
}

export default TSHOTVaultPage;
