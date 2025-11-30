import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import {
  CircleDollarSign,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Zap,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import Button from "../components/Button";
import { useHomepageStats } from "../hooks/useHomepageStats";

function TSHOT() {
  const location = useLocation();
  const { vaultSummary, analyticsData, loading, error } = useHomepageStats();

  // Wallet connection function
  const handleConnectWallet = async () => {
    try {
      await fcl.authenticate();
      // After successful authentication, redirect to the main app
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  // Handle scroll parameter after navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTo = params.get('scroll');
    
    if (scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [location.search]);

  // 1. HERO SECTION
  const HeroSection = () => (
    <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary pt-12 pb-16 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-6">
          <img
            src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
            alt="TSHOT Token"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            TSHOT Token
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-2 leading-relaxed">
            A liquid token backed 1:1 by eligible NBA Top Shot digital collectibles.
          </p>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-6 leading-relaxed">
            Transform your Top Shot digital collectibles into on-chain liquidity through minting and redemption.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <button
            onClick={handleConnectWallet}
            className="bg-opolis hover:bg-opolis-dark text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
          >
            <img
              src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
              alt="Vaultopolis"
              className="h-6 w-6"
            />
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <a 
            href="/vaults/tshot" 
            className="block bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center hover:border-opolis/50 hover:bg-white/15 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl font-bold text-opolis mb-1 group-hover:text-opolis/80 transition-colors">
              {loading ? "..." : error ? "Error" : vaultSummary?.total ? vaultSummary.total.toLocaleString() : "..."}
            </div>
            <div className="text-white/80 text-sm group-hover:text-white/90 transition-colors">Moments in Vault</div>
            <div className="text-opolis/60 text-xs mt-1">View Vault Contents →</div>
          </a>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-opolis mb-1">500+</div>
            <div className="text-white/80 text-sm">Active Users</div>
          </div>
          
          <a 
            href="/analytics" 
            className="block bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center hover:border-opolis/50 hover:bg-white/15 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-2xl font-bold text-opolis mb-1 group-hover:text-opolis/80 transition-colors">
              {loading ? "..." : error ? "Error" : analyticsData?.totalMomentsExchanged ? analyticsData.totalMomentsExchanged.toLocaleString() : "..."}
            </div>
            <div className="text-white/80 text-sm group-hover:text-white/90 transition-colors">Total Swaps</div>
            <div className="text-opolis/60 text-xs mt-1">View Analytics →</div>
          </a>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
            <div className="text-xl font-bold text-opolis mb-1">1:1</div>
            <div className="text-white/80 text-sm">Backed</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. HOW IT WORKS - Using homepage layout
  const HowItWorksBlock = () => (
    <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
          How It Works
        </h2>
        
        {/* Horizontal Flow - Desktop, Vertical - Mobile */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 sm:gap-4 md:gap-4 lg:gap-6">
          {/* Step 1 - Deposit */}
          <div className="flex flex-col items-center text-center flex-1 w-full">
            <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5 border border-white/20 hover:border-opolis/50 transition-colors w-full relative">
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-opolis rounded-full flex items-center justify-center text-white text-xs font-bold z-10">1</div>
              <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <div className="text-3xl">🎴</div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">Deposit</h3>
              <p className="text-xs sm:text-sm text-white/80">
                Add eligible NBA Top Shot digital collectibles to the vault.
              </p>
            </div>
          </div>

          {/* Arrow 1 */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <div className="text-opolis text-2xl">→</div>
          </div>
          <div className="md:hidden flex items-center justify-center py-0.5">
            <div className="text-opolis text-xl">↓</div>
          </div>

          {/* Step 2 - Mint TSHOT */}
          <div className="flex flex-col items-center text-center flex-1 w-full">
            <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5 border border-white/20 hover:border-opolis/50 transition-colors w-full relative">
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-opolis rounded-full flex items-center justify-center text-white text-xs font-bold z-10">2</div>
              <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <img
                  src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                  alt="TSHOT"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">Mint TSHOT</h3>
              <p className="text-xs sm:text-sm text-white/80">
                Deposit eligible collectibles to mint 1 TSHOT per item.
              </p>
            </div>
          </div>

          {/* Arrow 2 */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <div className="text-opolis text-2xl">→</div>
          </div>
          <div className="md:hidden flex items-center justify-center py-0.5">
            <div className="text-opolis text-xl">↓</div>
          </div>

          {/* Step 3 - Burn & Redeem */}
          <div className="flex flex-col items-center text-center flex-1 w-full">
            <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5 border border-white/20 hover:border-opolis/50 transition-colors w-full relative">
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-opolis rounded-full flex items-center justify-center text-white text-xs font-bold z-10">3</div>
              <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                <div className="text-3xl">📦</div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1">Burn & Redeem</h3>
              <p className="text-xs sm:text-sm text-white/80">
                Burn TSHOT to receive a collectible from the vault.
              </p>
            </div>
          </div>
        </div>
        
        {/* Liquidity Note */}
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-white/70 font-normal">
            TSHOT is designed to be liquid — you can trade it on DEXs like Increment.fi or Kittypunch.
          </p>
        </div>
      </div>
    </div>
  );

  // 3. USE CASES - Timeless
  const UseCasesBlock = () => (
    <div className="bg-brand-primary py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Use Cases
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            TSHOT enables new possibilities for your digital collectibles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Liquidity</h3>
            </div>
            <p className="text-white/80 text-sm">
              Convert eligible Top Shot digital collectibles into a liquid token that can be traded 24/7 on decentralized exchanges.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <CircleDollarSign className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Liquidity Provision</h3>
            </div>
            <p className="text-white/80 text-sm">
              Provide liquidity by pairing TSHOT with FLOW in supported pools to collect a share of trading fees.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Utility</h3>
            </div>
            <p className="text-white/80 text-sm">
              Use TSHOT in partner applications, games, and platforms that accept the token for new experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. SECURITY & TRUST
  const SecurityTrustBlock = () => (
    <div className="bg-brand-secondary py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Security & Trust
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Built with security and transparency as core principles.
          </p>
        </div>

        {/* Recognition & Validation */}
        <div className="mb-8 bg-white/10 rounded-lg p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Recognition & Validation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-opolis mb-1">🥇</div>
              <p className="text-white/90 text-sm font-semibold">Permissionless Hackathon</p>
              <p className="text-white/70 text-xs">First place in NYC (June 2025)</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-opolis mb-1">🏆</div>
              <p className="text-white/90 text-sm font-semibold">PL Genesis Modular Worlds</p>
              <p className="text-white/70 text-xs">'Flow Most Killer App' (July 2025)</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-opolis mb-1">🚀</div>
              <p className="text-white/90 text-sm font-semibold">Founders Forge</p>
              <p className="text-white/70 text-xs">Accelerator program (July 2025)</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold text-opolis mb-1">💰</div>
              <p className="text-white/90 text-sm font-semibold">Flow GrantDAO</p>
              <p className="text-white/70 text-xs">First place, 27.1% of all votes (August 2025)</p>
            </div>
          </div>
        </div>
        
        {/* Security Features */}
        <div className="bg-brand-primary rounded-xl p-6 border border-brand-border">
          <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-400" />
            Security
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">Built on Flow's secure blockchain</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">Uses on-chain, auditable randomness for selection</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">Designed to maintain 1:1 collateralization</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">All swaps executed on-chain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. FAQ SECTION
  const FAQBlock = () => (
    <div className="bg-brand-primary py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-white/80">
            Quick answers to common questions about TSHOT.
          </p>
        </div>

        <div className="space-y-4">
          <details className="group bg-white/10 rounded-lg p-4 border border-white/20">
            <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
              What is TSHOT?
              <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-white/80 mt-3">
              TSHOT is a liquid token that represents eligible NBA Top Shot digital collectibles. It allows you to trade and use those collectibles in on-chain experiences without listing each item individually, unlocking new utility and liquidity.
            </p>
          </details>
          
          <details className="group bg-white/10 rounded-lg p-4 border border-white/20">
            <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
              What can I do with TSHOT tokens?
              <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-white/80 mt-3">
              Trade TSHOT on DEXs, provide liquidity in pools that may offer trading-fee rewards, or burn TSHOT to redeem eligible digital collectibles automatically selected from the vault.
            </p>
          </details>
          
          <details className="group bg-white/10 rounded-lg p-4 border border-white/20">
            <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
              What types of digital collectibles can I deposit?
              <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-white/80 mt-3">
              Currently, we only accept Common and Fandom NBA Top Shot digital collectibles. Higher-tier collectibles (Rare, Legendary, etc.) are not supported at this time.
            </p>
          </details>
          
          <details className="group bg-white/10 rounded-lg p-4 border border-white/20">
            <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
              Is TSHOT secure?
              <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-white/80 mt-3">
              TSHOT is built on the Flow blockchain with smart-contract–based vault mechanics. The system uses on-chain randomness for selection, is designed to maintain 1:1 collateralization, and executes all swaps on-chain.
            </p>
          </details>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/guides/faq" 
            className="text-opolis hover:text-opolis/80 transition-colors inline-flex items-center gap-2 text-lg font-medium"
          >
            View All FAQ →
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );

  // 6. FINAL CTA SECTION
  const FinalCTABlock = () => (
    <div className="bg-gradient-to-t from-brand-primary to-brand-secondary py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
          Start unlocking the full potential of your NBA Top Shot collection with TSHOT.
        </p>
        
        <div className="flex justify-center">
          <Link to="/swap">
            <Button
              variant="opolis"
              size="lg"
              className="inline-flex items-center gap-3"
            >
              <img
                src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
                alt="Vaultopolis"
                className="h-6 w-6"
              />
              Launch Swap
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
        <title>Vaultopolis - TSHOT</title>
        <meta
          name="description"
          content="TSHOT is designed as a fully collateralised token on the Flow blockchain, backed 1-for-1 by eligible NBA Top Shot Common or Fandom digital collectibles. Learn about TSHOT token, its purpose, and how it works."
        />
        <meta name="keywords" content="tshot token, tshot price, tshot information, top shot token, flow token, nba top shot liquidity, tshot token details" />
        <link rel="canonical" href="https://vaultopolis.com/tshot" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="TSHOT Token | Tokenised Top Shot Liquidity" />
        <meta property="og:description" content="TSHOT is designed as a fully collateralised token backed 1-for-1 by eligible NBA Top Shot digital collectibles. Learn about TSHOT and how it works." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/tshot" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TSHOT Token | Tokenised Top Shot Liquidity" />
        <meta name="twitter:description" content="TSHOT is designed as a fully collateralised token backed 1-for-1 by eligible NBA Top Shot digital collectibles." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for Token */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "TSHOT Token",
            "description": "Designed as a fully collateralised token backed 1-for-1 by eligible NBA Top Shot digital collectibles",
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
      <div className="text-brand-text">
        {/* 1. Hero Section with Stats */}
        <HeroSection />
        
        {/* 2. How It Works */}
        <HowItWorksBlock />
        
        {/* 3. Use Cases */}
        <UseCasesBlock />
        
        {/* 4. Security & Trust */}
        <SecurityTrustBlock />
        
        {/* 5. FAQ */}
        <FAQBlock />
        
        {/* 6. Final CTA */}
        <FinalCTABlock />
      </div>
    </>
  );
}

export default TSHOT;
