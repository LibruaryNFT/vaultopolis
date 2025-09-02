import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import * as fcl from "@onflow/fcl";

import TSHOTInfo from "../components/TSHOTInfo";

function TSHOT() {
  const [vaultSummary, setVaultSummary] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wallet connection function
  const handleConnectWallet = async () => {
    try {
      await fcl.authenticate();
      // After successful authentication, redirect to the main app
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vaultResponse, analyticsResponse] = await Promise.all([
          fetch("https://api.vaultopolis.com/tshot-vault"),
          fetch("https://api.vaultopolis.com/wallet-leaderboard?limit=3000")
        ]);
        
        if (!vaultResponse.ok) {
          throw new Error(`Vault API error! status: ${vaultResponse.status}`);
        }
        if (!analyticsResponse.ok) {
          throw new Error(`Analytics API error! status: ${analyticsResponse.status}`);
        }
        
        const vaultData = await vaultResponse.json();
        const leaderboardData = await analyticsResponse.json();
        
        console.log("Raw leaderboard data:", leaderboardData);
        
        // Process analytics data similar to TSHOTAnalytics component
        const items = leaderboardData.items || [];
        console.log("Leaderboard items:", items);
        
        const totalDeposits = items.reduce((sum, user) => sum + (user.NFTToTSHOTSwapCompleted || 0), 0);
        const totalWithdrawals = items.reduce((sum, user) => sum + (user.TSHOTToNFTSwapCompleted || 0), 0);
        const totalMomentsExchanged = totalDeposits + totalWithdrawals;
        const totalUniqueWallets = items.length;
        
        console.log("Calculated totals:", { totalDeposits, totalWithdrawals, totalMomentsExchanged, totalUniqueWallets });
        
        const processedAnalyticsData = {
          totalMomentsExchanged,
          totalUniqueWallets,
          totalDeposits,
          totalWithdrawals
        };
        
        setVaultSummary(vaultData);
        setAnalyticsData(processedAnalyticsData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <TSHOTInfo 
          vaultSummary={vaultSummary} 
          analyticsData={analyticsData} 
          loading={loading} 
          error={error}
          onConnectWallet={handleConnectWallet}
        />
      </div>
    </>
  );
}

export default TSHOT;
