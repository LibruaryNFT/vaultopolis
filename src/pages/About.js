import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FaTwitter, FaMedium, FaUsers,
  FaRocket, FaCubes, FaAward, FaExchangeAlt, FaChartLine, FaPuzzlePiece
} from 'react-icons/fa';

// --- Reusable Low-Level Components ---

const StatCard = ({ icon, value, label, link }) => {
  const CardContent = () => (
    <>
      <div className="text-brand-accent mb-3">{icon}</div>
      <p className="text-3xl md:text-4xl font-bold text-brand-text">{value}</p>
      <p className="text-sm text-brand-text/70 mt-1">{label}</p>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-brand-primary p-6 rounded-lg text-center transition-transform hover:scale-105 focus:outline-none focus-visible:ring focus-visible:ring-brand-accent"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <div className="bg-brand-primary p-6 rounded-lg text-center">
      <CardContent />
    </div>
  );
};




// --- Main Page Component ---

const About = () => {
  // eslint-disable-next-line no-unused-vars
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
        
        // Process analytics data similar to TSHOTAnalytics component
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

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vaultopolis",
    "url": "https://vaultopolis.com",
    "logo": "https://vaultopolis.com/logo.png",
    "description": "Vaultopolis is a live, audited protocol designed to create new liquidity solutions for digital collectibles. Our first implementation, TSHOT, successfully demonstrates this power for NBA Top Shot collectors.",
    "foundingDate": "2025-04-17",
    "founder": {
      "@type": "Person",
      "name": "Justin (Libruary)",
      "jobTitle": "Founder & Lead Developer",
      "url": "https://x.com/Libruary_NFT",
      "sameAs": [
        "https://x.com/Libruary_NFT",
        "https://medium.com/@libruary"
      ],
      "description": "Software and cybersecurity professional from the FinTech sector with years of experience in building secure, scalable financial systems."
    },
    "award": [
      "First place at Permissionless hackathon in NYC (June 2025)",
      "PL Genesis Modular Worlds hackathon for 'Flow Most Killer App' (July 2025)",
      "Accepted into Founders Forge accelerator program (July 2025)",
      "First place in Flow GrantDAO Round 1, receiving 27.1% of 50,000 FLOW (August 2025)"
    ],
    "knowsAbout": [
      "Digital collectibles",
      "NBA Top Shot",
      "Flow blockchain",
      "DeFi liquidity solutions",
      "TSHOT tokens",
      "NFT tokenization"
    ]
  };

  return (
    <>
      {/* ─── SEO ─── */}
      <Helmet>
        <title>About Vaultopolis - Digital Collectibles Liquidity Protocol | Founder Story</title>
        <meta
          name="description"
          content="Learn about Vaultopolis, the digital collectibles liquidity protocol built by Justin (Libruary). Discover our mission to unlock NFT potential through TSHOT tokens and Flow blockchain technology."
        />
        <meta name="keywords" content="vaultopolis about, justin libruary founder, digital collectibles protocol, nba top shot liquidity, tshot tokens, flow blockchain, nft tokenization" />
        <link rel="canonical" href="https://vaultopolis.com/about" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="About Vaultopolis - Digital Collectibles Liquidity Protocol" />
        <meta property="og:description" content="Learn about Vaultopolis, the digital collectibles liquidity protocol built by Justin (Libruary). Discover our mission to unlock NFT potential." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/about" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/justin.png" />
        <meta property="og:image:alt" content="Justin (Libruary) - Founder of Vaultopolis" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Vaultopolis - Digital Collectibles Liquidity Protocol" />
        <meta name="twitter:description" content="Learn about Vaultopolis, the digital collectibles liquidity protocol built by Justin (Libruary)." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/justin.png" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-brand-background text-brand-text">
        {/* Container for main content with consistent horizontal padding */}
        <div className="max-w-4xl mx-auto px-4">

          {/* ACT 1: Set the Scene & Introduce the Opportunity */}
          <section className="text-center py-6 md:py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">
              Unlocking Your Collection's Full Potential
            </h1>
            <p className="text-xl text-brand-text/80 max-w-3xl mx-auto">
              For too long, digital collections have been static—assets locked away, illiquid, and disconnected from the dynamic world of DeFi. We know the frustration because we've lived it.
            </p>
            <p className="text-xl text-brand-text/80 max-w-3xl mx-auto mt-4">
              Our mission is to unlock the full potential of digital collectibles by creating dynamic, useful, and liquid solutions for every collector.
            </p>
          </section>
        </div>

        {/* ACT 2: Arrive at a Solution (Full-width background for contrast) */}
        <div className="bg-brand-secondary">
          <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
            <section>
              <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">The Solution: Vaultopolis</h2>
                  <p className="text-xl text-brand-text/80 max-w-3xl mx-auto">
                    Vaultopolis is a live, audited protocol designed to solve these problems. Our first implementation, <strong>TSHOT</strong>, successfully demonstrates this power for NBA Top Shot collectors.
                  </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 mt-12 text-center">
                <div className="bg-brand-primary p-6 rounded-lg">
                  <FaExchangeAlt className="mx-auto text-brand-accent" size={32} />
                  <h3 className="text-xl font-bold mt-4 mb-2">Swap for Moments</h3>
                  <p className="text-brand-text/70 text-sm">Instantly swap any Moment 1-for-1 to mint TSHOT, then swap back for a random Moment from the vault in a 24/7 treasure hunt.</p>
                </div>
                <div className="bg-brand-primary p-6 rounded-lg">
                  <FaChartLine className="mx-auto text-brand-accent" size={32} />
                  <h3 className="text-xl font-bold mt-4 mb-2">Earn Passive Yield</h3>
                  <p className="text-brand-text/70 text-sm">Provide liquidity by pairing TSHOT with FLOW on a decentralized exchange to earn passive income from trading fees.</p>
                </div>
                <div className="bg-brand-primary p-6 rounded-lg">
                  <FaPuzzlePiece className="mx-auto text-brand-accent" size={32} />
                  <h3 className="text-xl font-bold mt-4 mb-2">Unlock New Utility</h3>
                  <p className="text-brand-text/70 text-sm">Use TSHOT to enter wagering contests on partner platforms like aiSports FastBreak and compete for prize pools.</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ACT 3: Proof of Work & Trust Signals */}
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <section>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text text-center mb-12">Trusted by the Community, Validated by the Ecosystem</h2>
              
              {/* Live Platform Traction with enhanced typography */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-brand-text text-center mb-8">Live Platform Traction</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard 
                      icon={<FaCubes size={32} />} 
                      value={loading ? "..." : analyticsData?.totalMomentsExchanged ? `${(analyticsData.totalMomentsExchanged / 1000000).toFixed(1)}M+` : "..."} 
                      label="Moments Exchanged" 
                    />
                    <StatCard 
                      icon={<FaUsers size={32} />} 
                      value={loading ? "..." : analyticsData?.totalUniqueWallets ? analyticsData.totalUniqueWallets.toLocaleString() : "..."} 
                      label="Active Users" 
                    />
                    <StatCard icon={<FaRocket size={32} />} value="April 17, 2025" label="Project Launched" />
                </div>
              </div>

              {/* Recognition & Validation */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-brand-text text-center mb-8">Recognition & Validation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-brand-primary p-6 rounded-lg text-center">
                    <FaAward className="mx-auto text-brand-accent mb-3" size={32} />
                    <h4 className="text-lg font-bold text-brand-text mb-2">Permissionless Hackathon</h4>
                    <p className="text-brand-text/70 text-sm">First place in NYC (June 2025)</p>
                  </div>
                  <div className="bg-brand-primary p-6 rounded-lg text-center">
                    <FaAward className="mx-auto text-brand-accent mb-3" size={32} />
                    <h4 className="text-lg font-bold text-brand-text mb-2">PL Genesis Modular Worlds</h4>
                    <p className="text-brand-text/70 text-sm">'Flow Most Killer App' (July 2025)</p>
                  </div>
                  <div className="bg-brand-primary p-6 rounded-lg text-center">
                    <FaAward className="mx-auto text-brand-accent mb-3" size={32} />
                    <h4 className="text-lg font-bold text-brand-text mb-2">Founders Forge</h4>
                    <p className="text-brand-text/70 text-sm">Accelerator program (July 2025)</p>
                  </div>
                  <div className="bg-brand-primary p-6 rounded-lg text-center">
                    <FaAward className="mx-auto text-brand-accent mb-3" size={32} />
                    <h4 className="text-lg font-bold text-brand-text mb-2">Flow GrantDAO</h4>
                    <p className="text-brand-text/70 text-sm">First place, 27.1% of all votes (August 2025)</p>
                  </div>
                </div>
              </div>


          </section>
        </div>

        {/* ACT 4: The Team (Full-width background for contrast) */}
         <div className="bg-brand-secondary">
          <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
            <section>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text text-center mb-12">Forged From a Collector's Frustration</h2>
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  {/* Founder Image */}
                  <div className="flex-shrink-0">
                    <img
                      src="https://storage.googleapis.com/vaultopolis/justin.png"
                      alt="Justin (Libruary) - Founder of Vaultopolis"
                      className="w-48 h-56 object-cover rounded-lg shadow-lg shadow-black/20"
                      style={{ objectPosition: 'center 5%' }}
                    />
                  </div>
                  
                  {/* Founder Story */}
                  <div className="flex-grow text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-brand-text mb-4">Justin (Libruary)</h3>
                    <p className="text-lg text-brand-text/70 mb-4">Founder & Lead Developer</p>
                                         <p className="text-lg text-brand-text/80 leading-relaxed mb-8">
                       Vaultopolis wasn't born in a boardroom; it was forged from a collector's frustration. Our founder, Justin (Libruary), a passionate Top Shot collector with a career in FinTech and cybersecurity, was frustrated by the slow and manual process required for bulk trading, a bottleneck that made it impossible to achieve true liquidity. He envisioned a tool that could solve this for his own collection—and then he built it for the entire community.
                     </p>
                    <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <a
                        href="https://x.com/Libruary_NFT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-brand-accent/10 text-brand-accent px-6 py-3 rounded-lg font-semibold hover:bg-brand-accent/20 transition-colors"
                      >
                        <FaTwitter />
                        <span>Follow Justin on X</span>
                      </a>
                      <a
                        href="https://medium.com/@libruary/my-founders-story-how-a-2-000-ebay-scam-led-me-to-build-vaultopolis-tshot-c42fa5a084b6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-brand-accent/10 text-brand-accent px-6 py-3 rounded-lg font-semibold hover:bg-brand-accent/20 transition-colors"
                      >
                        <FaMedium />
                        <span>Read the Founder's Story</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
         </div>

        {/* ACT 5: Vision for the Future */}
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          <section className="bg-brand-primary rounded-lg p-8 text-center">
              <FaRocket className="text-brand-accent mx-auto mb-4" size={32} />
              <h2 className="text-3xl font-bold text-brand-text mb-4">Our Vision for the Future</h2>
              <p className="text-lg text-brand-text/80 max-w-2xl mx-auto">
                  TSHOT is just the beginning. Our vision is to build a suite of liquidity solutions for digital asset communities across the Web3 ecosystem, empowering collectors everywhere to unlock the full potential of what they own.
              </p>
          </section>
        </div>

        {/* Final Call to Action */}
        <div className="max-w-4xl mx-auto px-4 pb-6 md:pb-8">
          <section className="text-center bg-gradient-to-r from-brand-accent to-brand-accent/80 rounded-lg p-10 shadow-lg shadow-black/20">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Unlock Your Collection?</h3>
            <div className="flex justify-center">
              <a
                href="/tshot"
                className="bg-white text-brand-accent px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors text-lg inline-flex items-center justify-center"
              >
                Get Started with TSHOT
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;