// src/pages/TSHOT.jsx
import React from "react";
import { Helmet } from "react-helmet-async"; // ← NEW
import TSHOTInfo from "../components/TSHOTInfo";
import TSHOTVault from "../components/TSHOTVault";

function TSHOT() {
  return (
    <>
      {/* ───── SEO HEAD ───── */}
      <Helmet>
        <title>TSHOT | Tokenised Top Shot Liquidity on Flow</title>
        <meta
          name="description"
          content="TSHOT is a fully-collateralised token on the Flow blockchain, backed 1-for-1 by NBA Top Shot Common or Fandom Moments. Mint, burn, or swap TSHOT in seconds."
        />
        <link rel="canonical" href="https://vaultopolis.com/tshot" />
      </Helmet>

      {/* ───── PAGE BODY ───── */}
      <div className="w-full text-white space-y-4 mb-2">
        <TSHOTInfo />
        <TSHOTVault />
      </div>
    </>
  );
}

export default TSHOT;
