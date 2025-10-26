import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import GrailBountiesVault from "../../components/GrailBountiesVault";

function TreasuryVaultPage() {
  return (
    <>
      <Helmet>
        <title>Grail Bounties Vault | Treasury-Held NBA Top Shot Moments | Vaultopolis</title>
        <meta
          name="description"
          content="Browse the NBA Top Shot Moments held by the Grail Bounties Vault. Explore the collection available for trading and offers."
        />
        <meta name="keywords" content="grail bounties vault, treasury moments, nba top shot treasury, vaultopolis treasury, treasury collection" />
        <link rel="canonical" href="https://vaultopolis.com/vaults/treasury" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Grail Bounties Vault | Treasury-Held NBA Top Shot Moments" />
        <meta property="og:description" content="Browse the NBA Top Shot Moments held by the Grail Bounties Vault." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/vaults/treasury" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Grail Bounties Vault | Treasury-Held NBA Top Shot Moments" />
        <meta name="twitter:description" content="Browse the NBA Top Shot Moments held by the Vaultopolis Treasury." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for Grail Bounties Vault */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Grail Bounties Vault Contents",
            "description": "Browse the NBA Top Shot Moments held by the Vaultopolis Treasury",
            "url": "https://vaultopolis.com/vaults/treasury"
          })}
        </script>
      </Helmet>

      {/* Vault Navigation */}
      <div className="w-full mt-4 mb-4">
        <div className="max-w-6xl mx-auto mx-2 sm:mx-4">
          <div className="flex items-center gap-2 bg-brand-primary rounded-lg p-2" role="tablist" aria-label="Vault sections">
            <Link
              to="/vaults/tshot"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-blue"
            >
              <span aria-hidden="true" className="text-xl sm:text-2xl">🔒</span>
              <span className="hidden sm:inline text-sm sm:text-base">TSHOT</span>
              <span className="sm:hidden text-sm">TSHOT</span>
            </Link>
            <Link
              to="/vaults/treasury"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-opolis text-opolis bg-brand-secondary"
            >
              <span aria-hidden="true" className="text-xl sm:text-2xl">🏛️</span>
              <span className="hidden sm:inline text-sm sm:text-base">Grail Bounties</span>
              <span className="sm:hidden text-sm">Grail Bounties</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grail Bounties Vault Contents */}
      <div className="w-full">
        <GrailBountiesVault />
      </div>
    </>
  );
}

export default TreasuryVaultPage;
