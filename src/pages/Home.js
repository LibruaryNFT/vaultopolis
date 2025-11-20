import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaExchangeAlt,
  FaCubes,
  FaUsers,
  FaShieldAlt
} from 'react-icons/fa';
import { ArrowRight } from 'lucide-react';
import Button from '../components/Button';

const Home = () => {
  const [vaultSummary, setVaultSummary] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        
        const items = leaderboardData.items || [];
        const totalDeposits = items.reduce((sum, user) => sum + (user.NFTToTSHOTSwapCompleted || 0), 0);
        const totalWithdrawals = items.reduce((sum, user) => sum + (user.TSHOTToNFTSwapCompleted || 0), 0);
        const totalMomentsExchanged = totalDeposits + totalWithdrawals;
        const totalUniqueWallets = items.length;
        
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Vaultopolis</title>
        <meta
          name="description"
          content="Vaultopolis is a smart-contract platform unlocking liquidity and utility for digital collectibles. TSHOT is our first live token, giving Top Shot collectors instant liquidity."
        />
        <meta name="keywords" content="vaultopolis, digital collectibles, nft liquidity, flow blockchain, tshot, nba top shot, defi" />
        <link rel="canonical" href="https://vaultopolis.com" />
        
        <meta property="og:title" content="Vaultopolis - Unlock Liquidity for Digital Collectibles" />
        <meta property="og:description" content="A decentralized protocol that unlocks liquidity and utility for digital collectibles. TSHOT is our first live token for Top Shot collectors." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png" />
      </Helmet>

      <div className="w-full text-brand-text">
        {/* 1. HERO SECTION */}
        <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary pt-6 sm:pt-10 pb-6 sm:pb-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="mb-6 sm:mb-8">
              <img
                src="https://storage.googleapis.com/vaultopolis/Vaultopolis.png"
                alt="Vaultopolis"
                className="w-48 sm:w-64 md:w-80 mx-auto mb-3 sm:mb-4 object-contain"
              />
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                A platform that unlocks liquidity and new ways to use your digital collectibles.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                <FaCubes className="mx-auto text-opolis mb-2" size={24} />
                <div className="text-xl sm:text-2xl font-bold text-opolis mb-1">
                  {loading ? "..." : vaultSummary?.total ? vaultSummary.total.toLocaleString() : "..."}
                </div>
                <div className="text-white/80 text-xs sm:text-sm">Collectibles in Vault</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                <FaExchangeAlt className="mx-auto text-opolis mb-2" size={24} />
                <div className="text-xl sm:text-2xl font-bold text-opolis mb-1">
                  {loading ? "..." : analyticsData?.totalMomentsExchanged ? analyticsData.totalMomentsExchanged.toLocaleString() : "..."}
                </div>
                <div className="text-white/80 text-xs sm:text-sm">Total Swaps</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                <FaUsers className="mx-auto text-opolis mb-2" size={24} />
                <div className="text-xl sm:text-2xl font-bold text-opolis mb-1">500+</div>
                <div className="text-white/80 text-xs sm:text-sm">Active Users</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-center">
                <FaShieldAlt className="mx-auto text-opolis mb-2" size={24} />
                <div className="text-xl sm:text-2xl font-bold text-opolis mb-1">1:1</div>
                <div className="text-white/80 text-xs sm:text-sm">Backed</div>
              </div>
            </div>

            {/* Hero CTA */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <Link to="/swap">
                <Button variant="primary" size="lg" className="inline-flex items-center gap-2">
                  Launch Swap
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. TSHOT + HOW IT WORKS - GROUPED TOGETHER */}
        <div className="bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4">
            {/* TSHOT Header */}
            <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0"
              />
              <p className="text-base sm:text-lg md:text-xl text-white/90 font-semibold">
                TSHOT is our first live token, giving Top Shot collectors instant liquidity.
              </p>
            </div>

            {/* How It Works */}
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

              {/* Step 2 - Mint */}
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

              {/* Step 3 - Redeem */}
              <div className="flex flex-col items-center text-center flex-1 w-full">
                <div className="flex flex-col h-full bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-5 border border-white/20 hover:border-opolis/50 transition-colors w-full relative">
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-opolis rounded-full flex items-center justify-center text-white text-xs font-bold z-10">3</div>
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <div className="text-3xl">📦</div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">Redeem</h3>
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

            {/* Secondary CTA - Learn about TSHOT */}
            <div className="text-center mt-4 sm:mt-6">
              <Link 
                to="/tshot" 
                className="text-opolis text-sm font-semibold hover:underline"
              >
                Learn more about TSHOT →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;

