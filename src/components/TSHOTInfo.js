import React from "react";
import {
  CircleDollarSign,
  ShieldCheck,
  Dice5,
  Network,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Zap,
  TrendingUp,
  Lock,
  Eye,
  Heart,
  Rocket,
  ChevronRight,
  ChevronDown,
} from "lucide-react";



/* ---------- main component ---------- */
function TSHOTInfo({ vaultSummary, analyticsData, loading, error, onConnectWallet }) {
  // Default wallet connection function if not provided
  const handleConnectWallet = onConnectWallet || (() => {
    console.warn("onConnectWallet not provided to TSHOTInfo component");
  });
  
  // 1. HERO SECTION - What TSHOT is and why it's cool
  const HeroSection = () => (
    <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary pt-16 pb-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <img
            src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
            alt="TSHOT Token"
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 object-contain"
          />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Liquid Token for Your
            <span className="text-opolis block">NBA Top Shot Collection</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            Transform your Moments into instant liquidity. Swap Common and Fandom Moments 1-for-1 to mint TSHOT, 
            then use TSHOT for trading, yield farming, or burn TSHOT to receive random Moments from the vault.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleConnectWallet}
            className="bg-opolis hover:bg-opolis-dark text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
              >
                <img
                  src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
                  alt="Vaultopolis"
                  className="h-8 w-8"
                />
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // 2. ASSURANCE BLOCK - Proof of legitimacy and security
  const AssuranceBlock = () => (
    <div className="bg-white/5 backdrop-blur-sm border-y border-white/10 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            💯 Built for Trust & Security
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Your security is our priority. Here's proof that TSHOT is legitimate and safe.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Moments in Vault - Entire card clickable to Vault Contents */}
          <a 
            href="/vault-contents" 
            className="block bg-brand-primary/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:border-opolis/50 hover:bg-brand-primary/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-3xl font-bold text-opolis mb-2 group-hover:text-opolis/80 transition-colors">
              {loading ? "..." : error ? "Error" : vaultSummary?.total ? vaultSummary.total.toLocaleString() : "..."}
            </div>
            <div className="text-white/80 group-hover:text-white/90 transition-colors">Moments in Vault</div>
            <div className="text-opolis/60 text-xs mt-2">View Vault Contents →</div>
          </a>
          
          {/* Active Users - Static */}
          <div className="bg-brand-primary/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-opolis mb-2">
              {loading ? "..." : error ? "Error" : analyticsData?.totalUniqueWallets ? analyticsData.totalUniqueWallets.toLocaleString() : "..."}
            </div>
            <div className="text-white/80">Active Users</div>
          </div>
          
          {/* Total Swaps - Entire card clickable to Analytics */}
          <a 
            href="/analytics" 
            className="block bg-brand-primary/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center hover:border-opolis/50 hover:bg-brand-primary/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="text-3xl font-bold text-opolis mb-2 group-hover:text-opolis/80 transition-colors">
              {loading ? "..." : error ? "Error" : analyticsData?.totalMomentsExchanged ? analyticsData.totalMomentsExchanged.toLocaleString() : "..."}
            </div>
            <div className="text-white/80 group-hover:text-white/90 transition-colors">Total Swaps</div>
            <div className="text-opolis/60 text-xs mt-2">View Analytics →</div>
          </a>
          
          {/* Collateralized - Static */}
          <div className="bg-brand-primary/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-2xl font-bold text-opolis mb-2">100%</div>
            <div className="text-white/80">Collateralized</div>
          </div>
        </div>



        {/* Recognition & Validation */}
        <div className="mb-12 bg-white/10 rounded-lg p-6 border border-white/20">
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
        
        {/* Security Badges & Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-brand-primary/10 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-green-400" />
              Security & Audits
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white/90">Built on Flow's secure blockchain</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white/90">Verifiable Random Function (VRF) for fair swaps</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white/90">Smart contract audited and verified</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white/90">1:1 collateralization guaranteed</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/10 rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Network className="h-6 w-6 text-blue-400" />
              Ecosystem
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <img src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg" alt="Flow" className="h-6 w-6" />
                <span className="text-white/90 text-sm">Built on Flow</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <img src="https://cdn.prod.website-files.com/6072275935c4a2827f74c758/607c938ab04e03a1a5d40dd7_logo-dapperlabs-p-500.png" alt="Dapper" className="h-8 w-8 object-contain" />
                <span className="text-white/90 text-sm">Works with Dapper Wallet</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <img src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png" alt="TopShot" className="h-6 w-6" />
                <span className="text-white/90 text-sm">Supports TopShot Moments</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <img src="https://www.increment.fi/favicon.ico" alt="Increment" className="h-6 w-6" />
                <span className="text-white/90 text-sm">Trade on Increment.fi</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <img src="https://swap.kittypunch.xyz/Punch1.png" alt="PunchSwap" className="h-6 w-6" />
                <span className="text-white/90 text-sm">Trade on PunchSwap</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                <img src="https://www.aisportspro.com/ais_logo_new.svg" alt="aiSports" className="h-8 w-8 object-contain" />
                <span className="text-white/90 text-sm">Wager on aiSports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 3. EDUCATION BLOCK - Problem/Solution format
  const EducationBlock = () => (
    <div className="bg-brand-primary py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🤔 Why TSHOT Solves Real Problems
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            NBA Top Shot collectors face real challenges. Here's how TSHOT provides solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500/20 p-3 rounded-full">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
              <h3 className="text-2xl font-bold text-white">The Problem</h3>
        </div>
            <ul className="space-y-3 text-white/90">
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

          <div className="bg-white/10 rounded-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
              <h3 className="text-2xl font-bold text-white">The Solution</h3>
            </div>
            <ul className="space-y-3 text-white/90">
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

  // 4. DEMYSTIFICATION BLOCK - 3-step visual guide
  const DemystificationBlock = () => (
    <div id="how-it-works" className="bg-brand-secondary py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            👉 How It Works in 4 Simple Steps
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Getting started with TSHOT is easier than you think. Here's the complete bidirectional process.
          </p>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center flex flex-col h-full">
            <div className="bg-brand-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white border-4 border-white/20">
              1
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Connect Flow Wallet</h3>
            <p className="text-white/80 mb-6 flex-grow">
              Connect your Flow wallet to the Vaultopolis app. Optionally link your Dapper account to use your existing Top Shot assets.
            </p>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex justify-center items-center space-x-2 mb-2">
                <img 
                  src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg" 
                  alt="Flow Blockchain" 
                  className="h-12 w-12 object-contain"
                />
                <span className="text-white/60 text-xl font-bold">+</span>
                <img 
                  src="https://cdn.prod.website-files.com/6072275935c4a2827f74c758/607c938ab04e03a1a5d40dd7_logo-dapperlabs-p-500.png" 
                  alt="Dapper Wallet" 
                  className="h-14 w-14 object-contain"
                />
              </div>
              <p className="text-sm text-white/70">Flow Wallet + Dapper</p>
              <a href="/guides/flow-wallet" className="text-opolis hover:text-opolis-light text-xs mt-2 inline-block">
                Flow Wallet Guide →
              </a>
            </div>
          </div>

          <div className="text-center flex flex-col h-full">
            <div className="bg-brand-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white border-4 border-white/20">
              2
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Deposit a Moment</h3>
            <p className="text-white/80 mb-6 flex-grow">
              Select any Common or Fandom NBA Top Shot Moment from your collection and deposit it into the vault to mint TSHOT.
            </p>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <img 
                src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png" 
                alt="Top Shot Moment" 
                className="h-12 w-12 mx-auto mb-2 object-contain"
              />
              <p className="text-sm text-white/70">Common & Fandom Moments</p>
              <a href="/guides/nft-to-tshot" className="text-opolis hover:text-opolis-light text-xs mt-2 inline-block">
                NFT to TSHOT Guide →
              </a>
            </div>
          </div>

          <div className="text-center flex flex-col h-full">
            <div className="bg-brand-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white border-4 border-white/20">
              3
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Receive TSHOT</h3>
            <p className="text-white/80 mb-6 flex-grow">
              Instantly receive TSHOT tokens that you can trade, stake, or burn to receive random Moments from the vault.
            </p>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT Token" 
                className="h-12 w-12 mx-auto mb-2 object-contain"
              />
              <p className="text-sm text-white/70">TSHOT Tokens</p>
            </div>
          </div>

          <div className="text-center flex flex-col h-full">
            <div className="bg-brand-primary rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white border-4 border-white/20">
              4
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Burn TSHOT for Moments</h3>
            <p className="text-white/80 mb-6 flex-grow">
              Burn your TSHOT tokens to receive random Common or Fandom NBA Top Shot Moments from the vault. Every redemption is a surprise!
            </p>
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <img 
                src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png" 
                alt="Top Shot Moment" 
                className="h-12 w-12 mx-auto mb-2 object-contain"
              />
              <p className="text-sm text-white/70">Common & Fandom Moments</p>
              <a href="/guides/tshot-to-nft" className="text-opolis hover:text-opolis-light text-xs mt-2 inline-block">
                TSHOT to NFT Guide →
              </a>
            </div>
            </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/guides"
            className="bg-opolis hover:bg-opolis-dark text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 inline-flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Explore All Guides →
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );

  // 5. ASPIRATION BLOCK - Cool things you can do with TSHOT
  const AspirationBlock = () => (
    <div className="bg-brand-primary py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ✨ Unlock the Full Potential of Your Collection
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            TSHOT opens up a world of possibilities beyond just holding Moments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                <Dice5 className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Treasure Hunt</h3>
            </div>
                         <p className="text-white/80 mb-4">
               Burn TSHOT tokens to receive random Moments from the vault. Your next redemption could reveal a rare gem!
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
            <p className="text-white/80 mb-4">
              Trade TSHOT on DEXs like Increment.fi and PunchSwap for instant liquidity and arbitrage opportunities.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
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
            <p className="text-white/80 mb-4">
              Provide liquidity by pairing TSHOT with FLOW to earn passive income from trading fees.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
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
            <p className="text-white/80 mb-4">
              Use TSHOT to enter Top Shot FastBreak contests and compete for prize pools on aiSports.
            </p>
            <a href="https://www.aisportspro.com/fastbreak" target="_blank" rel="noreferrer" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
              Start Wagering <ExternalLink className="h-4 w-4" />
          </a>
        </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-500/20 p-3 rounded-lg group-hover:bg-pink-500/30 transition-colors">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Collection Building</h3>
            </div>
                         <p className="text-white/80 mb-4">
               Build diverse collections by burning TSHOT for random Moments, discovering new players and plays.
             </p>
                         <a href="/guides/tshot-to-nft" className="text-opolis hover:text-opolis-light transition-colors inline-flex items-center gap-2 text-sm font-medium">
               TSHOT to NFT Guide <ChevronRight className="h-4 w-4" />
          </a>
        </div>

          <div className="bg-white/10 rounded-xl p-6 border border-white/20 hover:border-opolis/50 transition-all duration-200 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-500/20 p-3 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                <Rocket className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Future Integration</h3>
            </div>
            <p className="text-white/80 mb-4">
              TSHOT is designed to integrate with future DeFi protocols, gaming platforms, and more.
            </p>
            <span className="text-white/60 text-sm">Coming Soon</span>
          </div>
        </div>

        
      </div>
    </div>
  );

  // 6. ECOSYSTEM BLOCK - Partners and integrations
  const EcosystemBlock = () => (
    <div className="bg-brand-secondary py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🌐 Ecosystem & Partners
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            TSHOT integrates with the best platforms in the Flow ecosystem.
          </p>
        </div>

    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      <a
        href="https://flow.com/"
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center space-y-2 w-32 text-center transition-transform hover:scale-105"
      >
        <div className="h-12 flex items-center justify-center">
          <img
            src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg"
            alt="Flow Logo"
            className="h-10"
          />
        </div>
            <p className="text-xs font-semibold text-white/80">
          Built on Flow
        </p>
      </a>
      <a
        href="https://www.meetdapper.com/"
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center space-y-2 w-32 text-center transition-transform hover:scale-105"
      >
        <div className="h-12 flex items-center justify-center">
          <img
            src="https://cdn.prod.website-files.com/6072275935c4a2827f74c758/607c938ab04e03a1a5d40dd7_logo-dapperlabs-p-500.png"
            alt="Dapper Labs Logo"
                className="h-10 object-contain"
          />
        </div>
            <p className="text-xs font-semibold text-white/80">
          Works with Dapper Wallet
        </p>
      </a>
      <a
        href="https://nbatopshot.com/"
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center space-y-2 w-32 text-center transition-transform hover:scale-105"
      >
        <div className="h-12 flex items-center justify-center">
          <img
            src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png"
            alt="TopShot"
            className="h-10"
          />
        </div>
            <p className="text-xs font-semibold text-white/80">
          Supports TopShot Moments
        </p>
      </a>
      <a
        href="https://app.increment.fi/"
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center space-y-2 w-32 text-center transition-transform hover:scale-105"
      >
        <div className="h-12 flex items-center justify-center">
          <img
            src="https://www.increment.fi/favicon.ico"
            alt="Increment.fi"
            className="h-10"
          />
        </div>
            <p className="text-xs font-semibold text-white/80">
          Trade on Increment.fi
        </p>
      </a>
      <a
        href="https://swap.kittypunch.xyz/"
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center space-y-2 w-32 text-center transition-transform hover:scale-105"
      >
        <div className="h-12 flex items-center justify-center">
          <img
            src="https://swap.kittypunch.xyz/Punch1.png"
            alt="PunchSwap Logo"
            className="h-10"
          />
        </div>
            <p className="text-xs font-semibold text-white/80">
          Trade on PunchSwap
        </p>
      </a>
      <a
        href="https://www.aisportspro.com/fastbreak"
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center justify-center space-y-2 w-32 text-center transition-transform hover:scale-105"
      >
        <div className="h-12 flex items-center justify-center">
          <img
            src="https://www.aisportspro.com/ais_logo_new.svg"
            alt="aiSports Logo"
                className="h-12 w-12 object-contain"
          />
        </div>
            <p className="text-xs font-semibold text-white/80">
          Wager on aiSports
        </p>
      </a>
        </div>
      </div>
    </div>
  );

  // 7. TRANSPARENCY BLOCK - Team and roadmap
  const TransparencyBlock = () => (
    <div className="bg-brand-primary py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            🤝 Transparent & Community-Driven
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Built by collectors, for collectors. We're committed to transparency and building a long-term project that empowers the Top Shot community.
          </p>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* COLUMN 1: THE FOUNDER */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Our Founder</h3>
            <div className="bg-white/10 rounded-lg p-6 border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-opolis rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">J</span>
          </div>
                <div>
                  <h4 className="text-white font-semibold text-xl">Justin (Libruary)</h4>
                  <p className="text-white/70">Founder & Lead Developer</p>
          </div>
        </div>
              <p className="text-white/80 mb-6 leading-relaxed">
                A passionate collector with a career in FinTech and cybersecurity, building the tools he wanted for his own collection.
              </p>
              <div className="flex gap-3 mb-4">
                <a 
                  href="https://x.com/Libruary_NFT" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/70 hover:text-opolis transition-colors"
                  aria-label="Justin's X Profile"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://medium.com/@libruary/my-founders-story-how-a-2-000-ebay-scam-led-me-to-build-vaultopolis-tshot-c42fa5a084b6" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/70 hover:text-opolis transition-colors"
                  aria-label="Justin's Medium Article"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                  </svg>
              </a>
            </div>
              <a 
                href="/about" 
                className="bg-opolis hover:bg-opolis-dark text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-2"
              >
                Read the Full Story →
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            </div>
            
          {/* COLUMN 2: OUR PRINCIPLES */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Our Principles</h3>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <div className="flex items-start gap-3 mb-3">
                  <Lock className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Open Source</h4>
                    <p className="text-white/70 text-sm">All smart contracts are open source and verifiable on <a href="https://www.flowscan.io/account/05b67ba314000b2d" target="_blank" rel="noopener noreferrer" className="text-opolis hover:text-opolis/80 underline">Flowscan</a>.</p>
          </div>
        </div>
      </div>

              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <div className="flex items-start gap-3 mb-3">
                  <Eye className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
        <div>
                    <h4 className="text-white font-semibold mb-2">Transparent</h4>
                    <p className="text-white/70 text-sm">Real-time vault statistics and transaction history are publicly visible on our <a href="/analytics" className="text-opolis hover:text-opolis/80 underline">analytics page</a>.</p>
            </div>
            </div>
        </div>

              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <div className="flex items-start gap-3 mb-3">
                  <Heart className="h-6 w-6 text-pink-400 mt-1 flex-shrink-0" />
        <div>
                    <h4 className="text-white font-semibold mb-2">For Collectors, By Collectors</h4>
                    <p className="text-white/70 text-sm">We're committed to building a long-term project that empowers the Top Shot community.</p>
            </div>
            </div>
              </div>
            </div>
          </div>
        </div>




            </div>
            </div>
  );

  // 7. FINAL CONVERSION BLOCK - Final CTA and FAQ
  const FinalConversionBlock = () => (
    <div className="bg-gradient-to-t from-brand-primary to-brand-secondary py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          ✅ Ready to Transform Your Top Shot Experience?
        </h2>
        <p className="text-lg text-white/80 mb-2">
          Join 199 other active users.
        </p>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Start unlocking the full potential of your NBA Top Shot collection with TSHOT.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={handleConnectWallet}
            className="bg-opolis hover:bg-opolis-dark text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
          >
            <img
              src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
              alt="Vaultopolis"
              className="h-6 w-6"
            />
            Get Started Now
            <ArrowRight className="h-5 w-5" />
          </button>
          <a
            href="/guides/quick-start"
            className="text-white/90 hover:text-white px-8 py-4 rounded-xl text-lg font-medium transition-colors border-2 border-white/20 hover:border-white/40 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Quick Start Guide
          </a>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/10 rounded-xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4 text-left">
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                What is TSHOT?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                TSHOT is a liquid token that represents your NBA Top Shot Moments. It allows you to trade, stake, and use your Moments in DeFi without selling them, unlocking new utility and liquidity.
              </p>
            </details>
            
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                What can I do with TSHOT tokens?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                Trade TSHOT on DEXs like Increment.fi and PunchSwap, provide liquidity for yield farming, use in wagering contests on aiSports, or burn them to receive random Moments from the vault.
              </p>
            </details>
            
            {/* Flow Wallet Guide Related FAQs */}
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                Is TSHOT audited and secure?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                Yes! TSHOT is built on the Flow blockchain with smart contracts that are audited and verifiable. The protocol uses secure vault mechanics and VRF technology for fair Moment selection.
              </p>
            </details>
            
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                What wallets do I need?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                You need a Flow wallet for all transactions. Optionally, you can link your Dapper account to access your existing Top Shot Moments. See our <a href="/guides/flow-wallet" className="text-opolis hover:text-opolis/80 underline">Flow Wallet Guide</a> and <a href="/guides/dapper-wallet" className="text-opolis hover:text-opolis/80 underline">Dapper Wallet Guide</a> for setup instructions.
              </p>
            </details>
            
            {/* NFT to TSHOT Guide Related FAQs */}
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                What types of Moments can I deposit?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                Currently, we only accept Common and Fandom NBA Top Shot Moments. Higher tier Moments (Rare, Legendary, etc.) are not supported at this time. We also exclude serials under 4000 by default for additional safety.
              </p>
            </details>
            
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                Is the swap instant?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                Yes! The swap from Moments to TSHOT is instant. You deposit your Moment and immediately receive TSHOT tokens that you can trade, stake, or use in DeFi applications.
              </p>
            </details>
            
            {/* TSHOT to NFT Guide Related FAQs */}
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                What Moments will I receive when burning TSHOT?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                You'll receive random Common or Fandom NBA Top Shot Moments from the vault. The selection is fair and tamper-proof using Flow's Verifiable Random Function (VRF) technology.
              </p>
            </details>
            
            <details className="group">
              <summary className="cursor-pointer text-white font-medium hover:text-opolis transition-colors flex items-center justify-between">
                Can I get my original Moment back?
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-white/80 mt-2 ml-4">
                While it's technically possible to get your original Moment back, it's very unlikely since you'll receive random Moments from the vault. Each redemption is a surprise!
              </p>
            </details>
            </div>
          
          {/* View All FAQ Link */}
          <div className="text-center mt-8 pt-6 border-t border-white/20">
            <a 
              href="/guides/faq" 
              className="text-opolis hover:text-opolis/80 transition-colors inline-flex items-center gap-2 text-lg font-medium"
            >
              View All Guides & FAQ →
            </a>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="text-brand-text">
      {/* 1. Hero Section */}
      <HeroSection />
      
      {/* 2. Assurance Block */}
      <AssuranceBlock />
      
      {/* 3. Education Block */}
      <EducationBlock />
      
      {/* 4. Demystification Block */}
      <DemystificationBlock />
      
      {/* 5. Aspiration Block */}
      <AspirationBlock />
      
      {/* 6. Ecosystem Block */}
      <EcosystemBlock />
      
      {/* 7. Transparency Block */}
      <TransparencyBlock />
      
      {/* 8. Final Conversion Block */}
      <FinalConversionBlock />
    </div>
  );
}

export default TSHOTInfo;