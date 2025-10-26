import React from "react";
import {
  CircleDollarSign,
  ShieldCheck,
  Dice5,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Zap,
  TrendingUp,
  Heart,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Button from "./Button";



/* ---------- main component ---------- */
function TSHOTInfo({ vaultSummary, analyticsData, loading, error, onConnectWallet }) {
  // Default wallet connection function if not provided
  const handleConnectWallet = onConnectWallet || (() => {
    console.warn("onConnectWallet not provided to TSHOTInfo component");
  });
  
  // 1. HERO SECTION - What TSHOT is and why it's cool
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
            The Liquid Token for Your
            <span className="text-opolis block">NBA Top Shot Collection</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6 leading-relaxed">
            Transform your Moments into instant liquidity. Swap Common and Fandom Moments 1-for-1 to mint TSHOT.
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

        {/* Key Stats - Moved up from Assurance Block */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {/* Moments in Vault - Clickable to Vault Contents */}
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
          
          {/* Active Users - Static */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
            <div className="text-2xl font-bold text-opolis mb-1">500+</div>
            <div className="text-white/80 text-sm">Active Users</div>
          </div>
          
          {/* Total Swaps - Clickable to Analytics */}
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
          
          {/* Collateralized - Static */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
            <div className="text-xl font-bold text-opolis mb-1">100%</div>
            <div className="text-white/80 text-sm">Collateralized</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. HOW-IT-WORKS BLOCK - Clear bidirectional process
  const HowItWorksBlock = () => (
    <div className="bg-brand-secondary py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            👉 How It Works - The Complete Loop
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Getting started with TSHOT is easier than you think. Here's the complete bidirectional process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-brand-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border-4 border-white/20">
              1
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Connect Wallet</h3>
            <p className="text-white/80 text-sm">
              Connect your Flow wallet and optionally link your Dapper account to access your Top Shot Moments.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-brand-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border-4 border-white/20">
              2
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Deposit Moments</h3>
            <p className="text-white/80 text-sm">
              Select any Common or Fandom NBA Top Shot Moment and deposit it to instantly mint TSHOT tokens.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-brand-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border-4 border-white/20">
              3
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Burn TSHOT</h3>
            <p className="text-white/80 text-sm">
              Burn your TSHOT tokens to receive random Common or Fandom Moments from the vault. Every redemption is a surprise!
            </p>
          </div>

          <div className="text-center">
            <div className="bg-brand-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border-4 border-white/20">
              4
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Trade TSHOT</h3>
            <p className="text-white/80 text-sm">
              Use TSHOT for DeFi activities: trade on DEXs, provide liquidity, or use in other protocols.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/guides"
            className="bg-opolis hover:bg-opolis-dark text-white px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 inline-flex items-center gap-2"
          >
            View All Guides →
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );

  // 3. PROBLEM/SOLUTION BLOCK - Why TSHOT exists
  const ProblemSolutionBlock = () => (
    <div className="bg-brand-primary py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            🤔 Why TSHOT Solves Real Problems
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            NBA Top Shot collectors face real challenges. Here's how TSHOT provides solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">The Problem</h3>
            </div>
            <ul className="space-y-2 text-white/90 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Bulk selling and buying Moments is slow and expensive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>No instant liquidity for your collection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Limited DeFi opportunities with Moments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Difficult to diversify without selling</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">The Solution</h3>
            </div>
            <ul className="space-y-2 text-white/90 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Instant 1:1 swaps for instant liquidity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Trade TSHOT on any DEX 24/7</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Access DeFi yields and opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Diversify without losing your Moments</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // 4. WHAT YOU CAN DO - External use cases
  const WhatYouCanDoBlock = () => (
    <div className="bg-brand-secondary py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ✨ What You Can Do With TSHOT
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Beyond the core vault loop, TSHOT opens up DeFi opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Dice5 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Treasure Hunt</h3>
            </div>
            <p className="text-white/80 mb-4 text-sm">
              Hunt for hidden gems in the vault. Every redemption is a surprise, giving you a shot at discovering a new player or a high-value Moment.
            </p>
            <a href="/guides/tshot-to-nft" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
              TSHOT to NFT Guide <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-lg group-hover:bg-green-500/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">DeFi Trading</h3>
            </div>
            <p className="text-white/80 mb-4 text-sm">
              Trade TSHOT on DEXs like Increment.fi and PunchSwap for instant liquidity and arbitrage opportunities.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <a href="https://app.increment.fi/swap?in=A.05b67ba314000b2d.TSHOT&out=A.1654653399040a61.FlowToken" target="_blank" rel="noreferrer" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
                <img src="https://www.increment.fi/favicon.ico" alt="Increment" className="h-4 w-4" />
                Increment.fi
              </a>
              <a href="https://swap.kittypunch.xyz/?tab=swap&token0=0xC618a7356FcF601f694C51578CD94144Deaee690&token1=0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e" target="_blank" rel="noreferrer" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
                <img src="https://swap.kittypunch.xyz/Punch1.png" alt="PunchSwap" className="h-4 w-4" />
                PunchSwap
              </a>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                <CircleDollarSign className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Yield Farming</h3>
            </div>
            <p className="text-white/80 mb-4 text-sm">
              Provide liquidity by pairing TSHOT with FLOW to earn passive income from trading fees.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <a href="https://app.increment.fi/liquidity/add" target="_blank" rel="noreferrer" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
                <img src="https://www.increment.fi/favicon.ico" alt="Increment" className="h-4 w-4" />
                Increment.fi
              </a>
              <a href="https://swap.kittypunch.xyz/?tab=liquidity&mode=add&token0=0xC618a7356FcF601f694C51578CD94144Deaee690&token1=0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e" target="_blank" rel="noreferrer" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
                <img src="https://swap.kittypunch.xyz/Punch1.png" alt="PunchSwap" className="h-4 w-4" />
                PunchSwap
              </a>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500/20 p-3 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                <Zap className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">FastBreak Wagering</h3>
            </div>
            <p className="text-white/80 mb-4 text-sm">
              Use TSHOT to enter Top Shot FastBreak contests and compete for prize pools on aiSports.
            </p>
            <a href="https://www.aisportspro.com/fastbreak" target="_blank" rel="noreferrer" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
              Start Wagering <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // 5. REWARDS PROGRAM - TSHOT Holder Rewards
  const RewardsProgramBlock = () => (
    <div id="rewards" className="bg-gradient-to-br from-opolis via-opolis-dark to-brand-blue py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🎁 Earn Weekly Rewards for Holding $TSHOT
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-2">
            22,500 $FLOW (~$6,300 USD) distributed over 12 weeks to $TSHOT holders on Flow EVM
          </p>
          <p className="text-sm text-white/70 max-w-2xl mx-auto">
            Campaign runs Oct 21, 2025 - Jan 13, 2026
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Base Rewards */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-300" />
              Base Reward
            </h3>
            <div className="text-3xl font-bold text-yellow-300 mb-2">1,500 $FLOW</div>
            <div className="text-white/70 text-sm mb-4">(~$420 USD) every week</div>
            <p className="text-white/80 text-sm">Claim your weekly rewards by connecting your wallet at merkl.xyz</p>
          </div>

          {/* Supercharged Rewards */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/30 border-2">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-300" />
              Supercharged Weeks
            </h3>
            <div className="text-3xl font-bold text-yellow-300 mb-2">3,000 $FLOW</div>
            <div className="text-white/70 text-sm mb-4">(~$840 USD) - Double rewards!</div>
            <div className="space-y-2 text-sm text-white/90">
              <div>🔥 Week 1: NBA Tip-Off (Oct 21-27)</div>
              <div>🔥 Week 6: Thanksgiving Games (Nov 25-Dec 1)</div>
              <div>🔥 Week 10: Christmas Day Games (Dec 23-29)</div>
            </div>
          </div>
        </div>

        {/* APR Calculation */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/20 mb-6">
          <h3 className="text-lg font-bold text-white mb-3">📊 Your Potential APR</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-white/70 mb-1">Base Week APR</div>
              <div className="text-2xl font-bold text-yellow-300">~445%</div>
            </div>
            <div>
              <div className="text-white/70 mb-1">Supercharged Week APR</div>
              <div className="text-2xl font-bold text-yellow-300">~890%</div>
            </div>
          </div>
          <p className="text-white/60 text-xs mt-3">*Based on current eligible supply of ~24,564 $TSHOT. APR will decrease as more users join.</p>
        </div>

        {/* How to Participate */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">🚀 How to Participate</h3>
          <div className="max-w-md mx-auto">
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="font-semibold text-white mb-2">Bridge & Hold $TSHOT on Flow EVM</div>
              <p className="text-white/90 text-sm">1. Bridge your TSHOT to Flow EVM</p>
              <a href="/guides/tshot-bridging" className="text-yellow-300 hover:text-yellow-200 inline-flex items-center gap-1 text-sm font-medium">
                Read Bridging Guide → <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-white/90 text-sm mt-4">2. Connect your EVM wallet and claim rewards</p>
              <a href="https://app.merkl.xyz/opportunities/flow/ERC20LOGPROCESSOR/0xC618a7356FcF601f694C51578CD94144Deaee690" target="_blank" rel="noreferrer" className="text-yellow-300 hover:text-yellow-200 inline-flex items-center gap-1 text-sm font-medium">
                View Rewards on Merkl → <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-6 text-center text-white/70 text-sm">
          <p>⚡ This campaign is for the community. Team, treasury, and LP wallets (96,718 $TSHOT) are blacklisted.</p>
          <p className="mt-2">The entire 22,500 $FLOW pool is distributed to an eligible supply of only ~24,564 $TSHOT.</p>
        </div>
      </div>
    </div>
  );

  // 6. TRUST SIGNALS - Recognition, Security, Founder
  const TrustSignalsBlock = () => (
    <div className="bg-brand-primary py-12 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            💯 Built for Trust & Security
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Your security is our priority. Here's proof that TSHOT is legitimate and safe.
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
        
        {/* Security & Founder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-secondary rounded-xl p-6 border border-brand-border">
            <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-green-400" />
              Security & Audits
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">Built on Flow's secure blockchain</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">Verifiable Random Function (VRF) for fair swaps</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">Smart contract audited and verified</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-brand-text/90 text-sm">1:1 collateralization guaranteed</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-secondary rounded-xl p-6 border border-brand-border">
            <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-2">
              <Heart className="h-6 w-6 text-pink-400" />
              For Collectors, By Collectors
            </h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-opolis rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <div>
                <h4 className="text-brand-text font-semibold">Justin (Libruary)</h4>
                <p className="text-brand-text/70 text-sm">Founder & Lead Developer</p>
              </div>
            </div>
            <p className="text-brand-text/80 text-sm mb-4">
              A passionate collector with a career in FinTech and cybersecurity, building the tools he wanted for his own collection.
            </p>
            <a 
              href="/about" 
              className="text-opolis hover:text-opolis/80 transition-colors inline-flex items-center gap-2 text-sm font-medium"
            >
              Read the Full Story →
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
  // 6. SIMPLE FAQ SECTION - Only 4 most important questions
  const FAQBlock = () => (
    <div className="bg-brand-secondary py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ❓ Frequently Asked Questions
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
              TSHOT is a liquid token that represents your NBA Top Shot Moments. It allows you to trade, stake, and use your Moments in DeFi without selling them, unlocking new utility and liquidity.
            </p>
          </details>
          
          <details className="group bg-white/10 rounded-lg p-4 border border-white/20">
            <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
              What can I do with TSHOT tokens?
              <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-white/80 mt-3">
              Trade TSHOT on DEXs like Increment.fi and PunchSwap, provide liquidity for yield farming, or burn them to receive random Moments from the vault.
            </p>
          </details>
          
          <details className="group bg-white/10 rounded-lg p-4 border border-white/20">
            <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
              What types of Moments can I deposit?
              <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-white/80 mt-3">
              Currently, we only accept Common and Fandom NBA Top Shot Moments. Higher tier Moments (Rare, Legendary, etc.) are not supported at this time.
            </p>
          </details>
          
          <details className="group bg-white/10 rounded-lg p-4 border border-white/20">
            <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
              Is TSHOT audited and secure?
              <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-white/80 mt-3">
              Yes! TSHOT is built on the Flow blockchain with smart contracts that are audited and verifiable. The protocol uses secure vault mechanics and VRF technology for fair Moment selection.
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

  // 7. FINAL CTA SECTION - Simple call to action
  const FinalCTABlock = () => (
    <div className="bg-gradient-to-t from-brand-primary to-brand-secondary py-12 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          ✅ Ready to Transform Your Top Shot Experience?
        </h2>
        <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
          Start unlocking the full potential of your NBA Top Shot collection with TSHOT.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleConnectWallet}
            variant="opolis"
            size="lg"
            className="inline-flex items-center gap-3"
          >
            <img
              src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
              alt="Vaultopolis"
              className="h-6 w-6"
            />
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/guides/quick-start'}
            className="inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Quick Start Guide
          </Button>
        </div>
      </div>
    </div>
  );


  return (
    <div className="text-brand-text">
      {/* 1. Hero Section with Stats */}
      <HeroSection />
      
      {/* 2. How It Works - Clear bidirectional process */}
      <HowItWorksBlock />
      
      {/* 3. Problem/Solution - Why TSHOT exists */}
      <ProblemSolutionBlock />
      
      {/* 4. What You Can Do - External use cases */}
      <WhatYouCanDoBlock />
      
      {/* 5. Rewards Program - TSHOT Holder Rewards */}
      <RewardsProgramBlock />
      
      {/* 6. Trust Signals - Recognition, Security, Founder */}
      <TrustSignalsBlock />
      
      {/* 6. FAQ */}
      <FAQBlock />
      
      {/* 7. Final CTA */}
      <FinalCTABlock />
    </div>
  );
}

export default TSHOTInfo;