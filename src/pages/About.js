import React from 'react';
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

const TeamMemberCard = ({ imageUrl, name, title, bio, recognition, twitterUrl, mediumUrl }) => {
  return (
    <div className="bg-brand-primary rounded-lg p-8 shadow-lg shadow-black/20 flex flex-col h-full">
      <div className="flex items-start mb-6"> {/* Changed to items-start for image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${name} - ${title} at Vaultopolis`}
            className="w-44 h-48 object-cover rounded-md mr-6 flex-shrink-0" /* Removed object positioning */
            style={{ objectPosition: 'center 5%' }} /* Custom positioning to start 5% from top */
          />
        ) : (
          <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mr-6 flex-shrink-0">
            <span className="text-3xl font-bold text-white">{name.charAt(0)}</span>
          </div>
        )}
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-brand-text">{name}</h3>
          <p className="text-brand-text/70">{title}</p>
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label={`${name}'s X Profile`} className="text-brand-accent hover:text-brand-accent/80 transition-colors mt-2 inline-block">
            <FaTwitter size={24} />
          </a>
        </div>
      </div>
      <div className="prose prose-lg text-brand-text/90 space-y-4 mb-6 flex-grow">
        {bio.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
       <div className="mt-auto pt-6 border-t border-brand-border/50 space-y-6">
        <div>
          <div className="flex items-center text-brand-text mb-2">
              <FaAward className="text-brand-accent mr-3 flex-shrink-0" size={20} />
              <h4 className="text-lg font-bold">Recognition & Validation</h4>
          </div>
          <ul className="text-brand-text/80 text-sm space-y-1 list-disc list-inside">
            <li>Won first place at Permissionless hackathon in NYC (June 2025)</li>
            <li>Won PL Genesis Modular Worlds hackathon for 'Flow Most Killer App' (July 2025)</li>
            <li>Accepted into Founders Forge accelerator program (July 2025)</li>
          </ul>
        </div>
        <a
          href={mediumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-2 bg-brand-accent/10 text-brand-accent px-4 py-2 rounded-lg font-semibold hover:bg-brand-accent/20 transition-colors text-sm w-full"
        >
          <FaMedium />
          <span>Read the Founder's Story</span>
        </a>
      </div>
    </div>
  );
};


// --- Main Page Component ---

const About = () => {
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
      "Accepted into Founders Forge accelerator program (July 2025)"
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
              Digital collectibles represent more than just ownership; they represent passion and community. We believe the next evolution for these assets is to become more dynamic, useful, and liquid, opening up new possibilities for collectors.
            </p>
          </section>
        </div>

        {/* ACT 2: Arrive at a Solution (Full-width background for contrast) */}
        <div className="bg-brand-secondary">
          <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
            <section>
              <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">The Solution: A Protocol for Liquidity</h2>
                  <p className="text-xl text-brand-text/80 max-w-3xl mx-auto">
                    Vaultopolis is a live, audited protocol designed to create new liquidity solutions. Our first implementation, <strong>TSHOT</strong>, successfully demonstrates this power for NBA Top Shot collectors.
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
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text text-center mb-12">Live Platform Traction</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard icon={<FaCubes size={32} />} value="5.7M+" label={`Moments Exchanged (as of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})})`} />
                  <StatCard icon={<FaUsers size={32} />} value="199" label="Active Users" />
                  <StatCard icon={<FaRocket size={32} />} value="April 17, 2025" label="Project Launched" />
              </div>
          </section>
        </div>

        {/* ACT 4: The Team (Full-width background for contrast) */}
         <div className="bg-brand-secondary">
          <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
            <section>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text text-center mb-12">Built By a Collector, For Collectors</h2>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
                {/* This grid is ready for more team members in the future */}
                <TeamMemberCard
                  imageUrl="https://storage.googleapis.com/vaultopolis/justin.png"
                  name="Justin (Libruary)"
                  title="Founder & Lead Developer"
                  bio={[
                    "Vaultopolis was built with a singular focus by a founder who experienced the collector's journey firsthand. He brings a defense-in-depth mindset from his career in the FinTech sector, where he specialized in software quality assurance and cybersecurity for a major financial institution, rigorously testing and securing large-scale banking systems.",
                    "This project was forged from a genuine need, combining deep technical expertise with a collector's passion."
                  ]}
                  recognition=""
                  twitterUrl="https://x.com/Libruary_NFT"
                  mediumUrl="https://medium.com/@libruary/my-founders-story-how-a-2-000-ebay-scam-led-me-to-build-vaultopolis-tshot-c42fa5a084b6"
                />
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
            <h3 className="text-2xl font-bold text-white mb-4">Join Our Journey</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Follow our progress and become part of the community as we build the future of digital asset liquidity.
            </p>
            <div className="flex items-center justify-center">
              <a
                href="https://x.com/Vaultopolis"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-brand-accent px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto flex items-center justify-center space-x-2"
              >
                <FaTwitter />
                <span>Follow @Vaultopolis on X</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;