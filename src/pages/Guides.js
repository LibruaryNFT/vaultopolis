import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FaWallet, FaExchangeAlt, FaLink, FaArrowRight, FaTrophy } from "react-icons/fa";
import { BookOpen, CircleDollarSign } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import ContentPanel from "../components/ContentPanel";

function Guides() {
  const guides = [
    {
      id: "what-is-tshot",
      title: "What is TSHOT?",
      description: "Complete overview of TSHOT: the liquid token for NBA Top Shot Moments. Learn how it works, what you can do with it, and why it solves real problems.",
      icon: <BookOpen className="text-3xl" />,
      path: "/guides/what-is-tshot"
    },
    {
      id: "quick-start",
      title: "Quick Start: From Zero to TSHOT",
      description: "Complete guide to get your first TSHOT tokens. Covers wallet setup and account linking.",
      icon: <BookOpen className="text-3xl" />,
      path: "/guides/quick-start"
    },
    {
      id: "nba-topshot-account",
      title: "Make an NBA Top Shot Account & Dapper Wallet",
      description: "Create your Top Shot account and get a Dapper Wallet automatically.",
      icon: <FaWallet className="text-3xl text-brand-accent" />,
      path: "/guides/dapper-wallet"
    },
    {
      id: "flow-wallet",
      title: "Make a Flow Wallet",
      description: "Additional Flow wallet options, security best practices, Top Shot integration.",
      icon: <FaWallet className="text-3xl text-brand-accent" />,
      path: "/guides/flow-wallet"
    },
    {
      id: "how-to-get-flow",
      title: "How to Get $FLOW",
      description: "Buy $FLOW on exchanges or in wallets. Withdraw to your Flow wallet to pay for transactions.",
      icon: <CircleDollarSign className="text-3xl text-brand-accent" />,
      path: "/guides/how-to-get-flow"
    },
    {
      id: "account-linking",
      title: "Account Linking",
      description: "Connect Top Shot to Flow wallet, enable external trading, Vaultopolis access.",
      icon: <FaLink className="text-3xl text-brand-accent" />,
      path: "/guides/account-linking"
    },
    {
      id: "defi-basics",
      title: "DeFi Basics",
      description: "Blockchain basics, wallets, NFTs, tokens, and gas fees explained.",
      icon: <BookOpen className="text-3xl text-brand-accent" />,
      path: "/guides/defi-basics"
    },
    {
      id: "nft-to-tshot",
      title: "Swapping NFT for TSHOT",
      description: "Vaultopolis swap process, benefits of tokenization, 1:1 collateralization.",
      icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
      path: "/guides/nft-to-tshot"
    },
    {
      id: "tshot-to-nft",
      title: "Swapping TSHOT for NFT",
      description: "Redemption process, Moment selection caveats, vault mechanics.",
      icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
      path: "/guides/tshot-to-nft"
    },
    {
      id: "tshot-bridging",
      title: "Bridge TSHOT from Cadence to EVM",
      description: "Transfer TSHOT tokens from Flow blockchain to EVM networks.",
      icon: <FaArrowRight className="text-3xl text-brand-accent" />,
      path: "/guides/tshot-bridging"
    },
    {
      id: "tshot-rewards",
      title: "TSHOT Rewards Program",
      description: "Earn weekly $FLOW rewards by holding TSHOT on Flow EVM. Learn how to participate in the Merkl campaign.",
      icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
      path: "/guides/tshot-rewards"
    },
    {
      id: "transfer",
      title: "Transfer NFTs",
      description: "Learn how to transfer NBA Top Shot Moments between Flow accounts or bridge them to Flow EVM. Bulk transfers up to 280 NFTs.",
      icon: <FaExchangeAlt className="text-3xl text-brand-accent" />,
      path: "/guides/transfer"
    },
    {
      id: "bounties",
      title: "Grail Bounties",
      description: "Complete guide to participating in Vaultopolis Grail Bounties. Accept offers for high-end NBA Top Shot Moments and earn rewards.",
      icon: <FaTrophy className="text-3xl text-brand-accent" />,
      path: "/guides/bounties"
    }
  ];

  // Categorized groupings for clearer navigation
  const catWalletSetup = guides.filter(g => ["nba-topshot-account", "flow-wallet", "how-to-get-flow", "account-linking", "defi-basics"].includes(g.id));
  const catUsingApp    = guides.filter(g => ["what-is-tshot", "quick-start", "nft-to-tshot", "tshot-to-nft"].includes(g.id));
  const catAdvanced    = guides.filter(g => ["tshot-bridging", "tshot-rewards", "transfer"].includes(g.id));
  const catBounties    = guides.filter(g => ["bounties"].includes(g.id));

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Vaultopolis Guides",
    "description": "Complete step-by-step guides for the Vaultopolis ecosystem including NBA Top Shot account creation, Dapper Wallet setup, and TSHOT token swaps.",
    "url": "https://vaultopolis.com/guides",
    "numberOfItems": guides.length,
    "itemListElement": guides.map((guide, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "HowTo",
        "name": guide.title,
        "description": guide.description,
        "url": `https://vaultopolis.com${guide.path}`,
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "0"
        }
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Vaultopolis - Guides</title>
        <meta name="description" content="Complete step-by-step guides for the Vaultopolis ecosystem. Learn how to create wallets, link accounts, and swap NBA Top Shot Moments for TSHOT tokens." />
        <meta name="keywords" content="Vaultopolis guides, TSHOT tutorial, NBA Top Shot guide, Flow wallet setup, Dapper wallet, account linking, NFT swapping" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Guides - Vaultopolis | Complete Step-by-Step Tutorials" />
        <meta property="og:description" content="Complete step-by-step guides for the Vaultopolis ecosystem. Learn how to create wallets, link accounts, and swap NBA Top Shot Moments for TSHOT tokens." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/guides" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Guides - Vaultopolis | Complete Step-by-Step Tutorials" />
        <meta name="twitter:description" content="Complete step-by-step guides for the Vaultopolis ecosystem. Learn how to create wallets, link accounts, and swap NBA Top Shot Moments for TSHOT tokens." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="w-full">
        {/* Category 1: TSHOT */}
        <div className="mx-2 sm:mx-4">
          <div className="max-w-6xl mx-auto">
          <ContentPanel title="TSHOT">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {catUsingApp.map((guide) => (
                <div key={guide.id} className="group">
                  {guide.path === "/guides/quick-start" ? (
                    // Featured Quick Start remains highlighted
                    <Link to={guide.path} className="group block h-full">
                      <Card variant="accent" padding="sm" hover={true} className="h-full flex flex-col">
                        <div className="absolute top-2 right-2 z-20">
                          <span className="px-2 py-1 bg-white text-brand-accent font-bold text-xs rounded-full shadow-lg">FEATURED</span>
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-center mb-3">
                            <div className="bg-white/20 p-2 rounded-full border border-white/30 group-hover:bg-white/30 group-hover:border-white/50 transition-all duration-300">
                              <div className="text-white">{guide.icon}</div>
                            </div>
                          </div>
                          <h3 className="text-base font-bold text-white mb-2 group-hover:text-white transition-colors flex-shrink-0 select-none guide-title text-center">{guide.title}</h3>
                          <p className="text-white/90 mb-3 text-xs leading-relaxed text-center flex-grow">{guide.description}</p>
                        </div>
                      </Card>
                    </Link>
                  ) : (
                    <Link to={guide.path} className="group block h-full">
                      <Card variant="elevated" padding="sm" hover={true} className="h-full flex flex-col">
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-center mb-3">
                            <div className="bg-brand-accent/10 p-2 rounded-full border border-brand-accent/20 group-hover:bg-brand-accent/20 group-hover:border-brand-accent/40 transition-all duration-300">{guide.icon}</div>
                          </div>
                          <h3 className="text-base font-bold text-brand-text mb-2 group-hover:text-brand-accent transition-colors flex-shrink-0 select-none guide-title text-center">{guide.title}</h3>
                          <p className="text-brand-text/80 mb-3 text-xs leading-relaxed text-center flex-grow">{guide.description}</p>
                        </div>
                      </Card>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </ContentPanel>
          </div>
        </div>

        {/* Category 2: Getting Your Wallet Set Up */}
        <div className="mx-2 sm:mx-4">
          <div className="max-w-6xl mx-auto">
          <ContentPanel title="Getting Your Wallet Set Up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {catWalletSetup.map((guide) => (
                <div key={guide.id} className="group">
                  <Link
                    to={guide.path}
                    className="group block h-full"
                  >
                    <Card 
                      variant="elevated" 
                      padding="sm" 
                      hover={true}
                      className="h-full flex flex-col"
                    >
                      {/* Card Content */}
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon with enhanced background */}
                        <div className="flex justify-center mb-3">
                          <div className="bg-brand-accent/10 p-2 rounded-full border border-brand-accent/20 group-hover:bg-brand-accent/20 group-hover:border-brand-accent/40 transition-all duration-300">
                            {guide.icon}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-base font-bold text-brand-text mb-2 group-hover:text-brand-accent transition-colors flex-shrink-0 select-none guide-title text-center">
                          {guide.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-brand-text/80 mb-3 text-xs leading-relaxed text-center flex-grow">
                          {guide.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </ContentPanel>
          </div>
        </div>

        {/* Category 3: Advanced DeFi & Rewards */}
        <div className="mx-2 sm:mx-4">
          <div className="max-w-6xl mx-auto">
          <ContentPanel title="Advanced DeFi & Rewards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {catAdvanced.map((guide) => (
                <div key={guide.id} className="group">
                  <Link to={guide.path} className="group block h-full">
                    <Card variant="elevated" padding="sm" hover={true} className="h-full flex flex-col">
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-center mb-3">
                          <div className="bg-brand-accent/10 p-2 rounded-full border border-brand-accent/20 group-hover:bg-brand-accent/20 group-hover:border-brand-accent/40 transition-all duration-300">{guide.icon}</div>
                        </div>
                        <h3 className="text-base font-bold text-brand-text mb-2 group-hover:text-brand-accent transition-colors flex-shrink-0 select-none guide-title text-center">{guide.title}</h3>
                        <p className="text-brand-text/80 mb-3 text-xs leading-relaxed text-center flex-grow">{guide.description}</p>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </ContentPanel>
          </div>
        </div>

        {/* Category 4: Grail Bounties */}
        {catBounties.length > 0 && (
          <div className="mx-2 sm:mx-4">
            <div className="max-w-6xl mx-auto">
            <ContentPanel title="Grail Bounties">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {catBounties.map((guide) => (
                  <div key={guide.id} className="group">
                    <Link to={guide.path} className="group block h-full">
                      <Card variant="elevated" padding="sm" hover={true} className="h-full flex flex-col">
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex justify-center mb-3">
                            <div className="bg-brand-accent/10 p-2 rounded-full border border-brand-accent/20 group-hover:bg-brand-accent/20 group-hover:border-brand-accent/40 transition-all duration-300">{guide.icon}</div>
                          </div>
                          <h3 className="text-base font-bold text-brand-text mb-2 group-hover:text-brand-accent transition-colors flex-shrink-0 select-none guide-title text-center">{guide.title}</h3>
                          <p className="text-brand-text/80 mb-3 text-xs leading-relaxed text-center flex-grow">{guide.description}</p>
                        </div>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </ContentPanel>
            </div>
          </div>
        )}

        {/* FAQ Link Section */}
        <div className="mx-2 sm:mx-4">
          <div className="max-w-6xl mx-auto">
          <ContentPanel>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Looking for a quick answer?
              </h2>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => window.location.href = '/guides/faq'}
              >
                View Frequently Asked Questions →
              </Button>
            </div>
          </ContentPanel>
          </div>
        </div>
      </div>
    </>
  );
}

export default Guides; 