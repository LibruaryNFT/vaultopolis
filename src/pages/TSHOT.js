import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import TSHOTInfo from "../components/TSHOTInfo";

function TSHOT() {
  const [vaultSummary, setVaultSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVaultSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://api.vaultopolis.com/tshot-vault");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVaultSummary(data);
      } catch (err) {
        console.error("Failed to fetch vault summary:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVaultSummary();
  }, []);

  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
        <title>TSHOT Token | Tokenised Top Shot Liquidity on Flow Blockchain</title>
        <meta
          name="description"
          content="TSHOT is a fully-collateralised token on the Flow blockchain, backed 1-for-1 by NBA Top Shot Common or Fandom Moments. Learn about TSHOT token, its purpose, and how it works."
        />
        <meta name="keywords" content="tshot token, tshot price, tshot information, top shot token, flow token, nba top shot liquidity, tshot token details" />
        <link rel="canonical" href="https://vaultopolis.com/tshot" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="TSHOT Token | Tokenised Top Shot Liquidity" />
        <meta property="og:description" content="TSHOT is a fully-collateralised token backed 1-for-1 by NBA Top Shot Moments. Learn about TSHOT and how it works." />
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
        <TSHOTInfo vaultSummary={vaultSummary} loading={loading} error={error} />
      </div>
    </>
  );
}

export default TSHOT;
