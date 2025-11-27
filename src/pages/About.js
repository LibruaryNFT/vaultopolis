import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Rocket,
  Award
} from 'lucide-react';

// --- Main Page Component ---

const About = () => {

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vaultopolis",
    "url": "https://vaultopolis.com",
    "logo": "https://vaultopolis.com/logo.png",
    "description": "Vaultopolis is a live protocol designed to create new liquidity solutions for digital collectibles. Our first implementation, TSHOT, successfully demonstrates this power for NBA Top Shot collectors.",
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
        <title>Vaultopolis - About</title>
        <meta
          name="description"
          content="Learn about Vaultopolis, the digital collectibles liquidity protocol built by Justin (Libruary). Discover our mission to unlock NFT potential through innovative tokenization solutions."
        />
        <meta name="keywords" content="vaultopolis about, justin libruary founder, digital collectibles protocol, nba top shot liquidity, flow blockchain, nft tokenization" />
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

      <div className="w-full min-h-screen bg-brand-background text-brand-text">
        <div className="max-w-4xl mx-auto px-4">

          {/* Hero Section */}
          <section className="text-center py-6 md:py-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-text/60 mb-2">
              About Vaultopolis
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-4">
              Unlocking the Full Potential of Digital Collectibles
            </h1>
            <p className="text-xl text-brand-text/80 max-w-3xl mx-auto">
              We're building the liquidity layer for digital collectibles — transforming static collections into programmable, on-chain assets.
            </p>
          </section>

          {/* What We Do */}
          <div className="bg-brand-secondary rounded-lg p-6 md:p-8 mb-8">
            <section>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4 text-center">What We Do</h2>
              <p className="text-lg text-brand-text/80 max-w-3xl mx-auto text-center leading-relaxed">
                Vaultopolis is an on-chain liquidity protocol that gives digital collectors real financial utility over what they own. We turn collectibles into liquid, tradeable, programmable tokens — enabling instant liquidity, DeFi integrations, and new forms of utility across the Flow ecosystem.
              </p>
            </section>
          </div>

          {/* Our Vision */}
          <section className="bg-brand-primary rounded-lg p-8 text-center mb-8">
            <Rocket className="text-brand-accent mx-auto mb-4" size={32} />
            <h2 className="text-3xl font-bold text-brand-text mb-4">Our Vision</h2>
            <p className="text-lg text-brand-text/80 max-w-2xl mx-auto leading-relaxed">
              We're building toward a future where digital collectibles have deep, programmable liquidity — giving collectors new ways to engage with and derive value from what they own.
            </p>
          </section>

          {/* Ecosystem Recognition */}
          <section className="bg-brand-secondary rounded-lg p-6 md:p-8 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-text text-center mb-6">
              Ecosystem Recognition
            </h2>
            <p className="text-lg text-brand-text/80 max-w-3xl mx-auto text-center mb-8">
              Vaultopolis has been battle-tested in the Flow ecosystem and recognised by leading programs and communities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-brand-primary p-6 rounded-lg text-center">
                <Award className="mx-auto text-brand-accent mb-3" size={32} />
                <h4 className="text-lg font-bold text-brand-text mb-2">Permissionless Hackathon</h4>
                <p className="text-brand-text/70 text-sm">First place in NYC (June 2025)</p>
              </div>
              <div className="bg-brand-primary p-6 rounded-lg text-center">
                <Award className="mx-auto text-brand-accent mb-3" size={32} />
                <h4 className="text-lg font-bold text-brand-text mb-2">PL Genesis Modular Worlds</h4>
                <p className="text-brand-text/70 text-sm">'Flow Most Killer App' (July 2025)</p>
              </div>
              <div className="bg-brand-primary p-6 rounded-lg text-center">
                <Award className="mx-auto text-brand-accent mb-3" size={32} />
                <h4 className="text-lg font-bold text-brand-text mb-2">Founders Forge</h4>
                <p className="text-brand-text/70 text-sm">Accelerator program (July 2025)</p>
              </div>
              <div className="bg-brand-primary p-6 rounded-lg text-center">
                <Award className="mx-auto text-brand-accent mb-3" size={32} />
                <h4 className="text-lg font-bold text-brand-text mb-2">Flow GrantDAO</h4>
                <p className="text-brand-text/70 text-sm">First place, 27.1% of all votes (August 2025)</p>
              </div>
            </div>
          </section>

          {/* Founder Story */}
          <div className="bg-brand-secondary rounded-lg p-6 md:p-8 mb-8">
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
                        <span className="text-xl">𝕏</span>
                        <span>Follow Justin on X</span>
                      </a>
                      <a
                        href="https://medium.com/@libruary/my-founders-story-how-a-2-000-ebay-scam-led-me-to-build-vaultopolis-tshot-c42fa5a084b6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-brand-accent/10 text-brand-accent px-6 py-3 rounded-lg font-semibold hover:bg-brand-accent/20 transition-colors"
                      >
                        <span className="text-xl font-bold">M</span>
                        <span>Read the Founder's Story</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </>
  );
};

export default About;
