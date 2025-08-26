import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaHome } from "react-icons/fa";
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
      <div className="w-full text-white mb-6">
        {/* Breadcrumb Navigation */}
        <nav className="max-w-4xl mx-auto px-4 pt-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-brand-text/70">
            <li>
              <Link to="/" className="hover:text-brand-accent transition-colors flex items-center">
                <FaHome className="mr-1" size={14} />
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link to="/guides" className="hover:text-brand-accent transition-colors">
                Guides
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-brand-text">Quick Start</span>
            </li>
          </ol>
        </nav>
        
        {/* Back to Guides Button */}
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <Link 
            to="/guides" 
            className="inline-flex items-center px-4 py-2 rounded bg-brand-accent text-white hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-primary"
            aria-label="Return to all guides"
            role="button"
            tabIndex={0}
          >
            <FaArrowLeft className="mr-3 text-lg" aria-hidden="true" />
            <span className="font-medium">Back to All Guides</span>
          </Link>
        </div>

        {/* Quick Start Guide Component */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <QuickStartGuide variant="full" />
        </div>
      </div>
    </>
  );
}

export default QuickStartGuidePage; 