import React, { useState } from "react";
import { Helmet } from "react-helmet-async";

import TSHOTInfo from "../components/TSHOTInfo";
import TSHOTVault from "../components/TSHOTVault";
import TSHOTAnalytics from "../components/TSHOTAnalytics";

function TSHOT() {
  const [vaultSummary, setVaultSummary] = useState(null);

  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
        <title>TSHOT Token | Tokenised Top Shot Liquidity on Flow Blockchain</title>
        <meta
          name="description"
          content="TSHOT is a fully-collateralised token on the Flow blockchain, backed 1-for-1 by NBA Top Shot Common or Fandom Moments. View TSHOT analytics, vault data, token price, and real-time statistics."
        />
        <meta name="keywords" content="tshot token, tshot price, tshot analytics, top shot token, flow token, nba top shot liquidity, tshot vault, tshot statistics" />
        <link rel="canonical" href="https://vaultopolis.com/tshot" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="TSHOT Token | Tokenised Top Shot Liquidity" />
        <meta property="og:description" content="TSHOT is a fully-collateralised token backed 1-for-1 by NBA Top Shot Moments. View real-time analytics and vault data." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/tshot" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TSHOT Token | Tokenised Top Shot Liquidity" />
        <meta name="twitter:description" content="TSHOT is a fully-collateralised token backed 1-for-1 by NBA Top Shot Moments." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for Token */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "TSHOT Token",
            "description": "Fully-collateralised token backed 1-for-1 by NBA Top Shot Moments",
            "brand": {
              "@type": "Brand",
              "name": "Vaultopolis"
            },
            "category": "Cryptocurrency Token",
            "url": "https://vaultopolis.com/tshot"
          })}
        </script>
      </Helmet>

      {/* ─── PAGE BODY ─── */}
      {/* space-y-2 = one uniform vertical gap between every major section */}
      <div className="w-full text-white space-y-2 mb-2">
        <TSHOTInfo vaultSummary={vaultSummary} />
        <TSHOTVault onSummaryUpdate={setVaultSummary} />
        <TSHOTAnalytics />
      </div>
    </>
  );
}

export default TSHOT;
