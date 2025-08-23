import React from "react";
import { Helmet } from "react-helmet-async";
import QuickStartGuide from "../../components/QuickStartGuide";

function QuickStartGuidePage() {
  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
        <title>Quick Start: From Zero to TSHOT | Vaultopolis</title>
        <meta
          name="description"
          content="Complete step-by-step guide to get your first TSHOT tokens. Covers wallet setup, account linking, and two paths to acquire TSHOT on the Flow blockchain."
        />
        <meta name="keywords" content="tshot quick start, vaultopolis guide, flow wallet setup, dapper wallet, nba top shot, tshot token guide" />
        <link rel="canonical" href="https://vaultopolis.com/guides/quick-start" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Quick Start: From Zero to TSHOT | Vaultopolis" />
        <meta property="og:description" content="Complete step-by-step guide to get your first TSHOT tokens. Covers wallet setup, account linking, and two paths to acquire TSHOT." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/guides/quick-start" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Quick Start: From Zero to TSHOT | Vaultopolis" />
        <meta name="twitter:description" content="Complete step-by-step guide to get your first TSHOT tokens." />
      </Helmet>

      {/* ─── PAGE BODY ─── */}
      <div className="w-full text-white space-y-6 mb-6">
        {/* Header Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4 pt-8">
          <h1 className="text-5xl font-bold text-brand-text">
            Quick Start Guide
          </h1>
          <p className="text-xl text-brand-text/80 max-w-2xl mx-auto leading-relaxed">
            From Zero to TSHOT in 5 Simple Steps
          </p>
        </div>

        {/* Quick Start Guide Component */}
        <div className="max-w-6xl mx-auto px-4">
          <QuickStartGuide variant="full" />
        </div>
      </div>
    </>
  );
}

export default QuickStartGuidePage; 