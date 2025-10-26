import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { FaBookOpen } from "react-icons/fa";
import PageWrapper from "../../components/PageWrapper";
import ContentPanel from "../../components/ContentPanel";
import Card from "../../components/Card";
import Button from "../../components/Button";

function QuickStartGuidePage() {
  return (
    <>
      <Helmet>
        <title>Quick Start: From Zero to TSHOT - Vaultopolis</title>
        <meta name="description" content="Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT." />
        <meta name="keywords" content="tshot quick start, vaultopolis guide, flow wallet setup, dapper wallet, nba top shot, tshot token guide" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Quick Start: From Zero to TSHOT - Vaultopolis" />
        <meta property="og:description" content="Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://vaultopolis.com/guides/quick-start" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Quick Start: From Zero to TSHOT - Vaultopolis" />
        <meta name="twitter:description" content="Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT." />
      </Helmet>

      <div className="w-full">
        {/* Breadcrumb Navigation */}
        <PageWrapper padding="sm">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li>
                <Link to="/guides" className="hover:text-opolis transition-colors flex items-center">
                  <FaBookOpen className="mr-1" size={14} />
                  Guides
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-white">Quick Start</span>
              </li>
            </ol>
          </nav>
        </PageWrapper>

        {/* Main Content */}
        <PageWrapper padding="md">
          <ContentPanel 
            title="Quick Start: From Zero to TSHOT" 
            subtitle="Get your first TSHOT tokens in 5 simple steps. Start with Flow wallet setup, then optionally integrate Top Shot, and learn to use TSHOT."
          >
            <div className="space-y-6">
              {/* Step Cards */}
              <div className="space-y-6">
                {/* Step 1 */}
                <Card variant="elevated" padding="md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-text mb-2">
                        Get a Flow Wallet (Required)
                      </h3>
                      <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                        You need the official Flow wallet to interact with Vaultopolis and trade on DEXs. This is the essential first step.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => window.location.href = '/guides/flow-wallet'}
                          className="inline-flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Follow the guide: Make a Flow Wallet
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 2 */}
                <Card variant="elevated" padding="md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
                        Get a Dapper Wallet (Optional)
                        <span className="text-xs bg-brand-primary/50 text-brand-text/70 px-2 py-1 rounded-full">
                          Optional
                        </span>
                      </h3>
                      <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                        If you want to use your existing NBA Top Shot Moments, you'll need a Dapper Wallet. This automatically comes with your Top Shot account.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => window.location.href = '/guides/dapper-wallet'}
                          className="inline-flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Follow the guide: Make an NBA Top Shot Account & Dapper Wallet
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 3 */}
                <Card variant="elevated" padding="md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-text mb-2 flex items-center gap-2">
                        Account Linking (Optional)
                        <span className="text-xs bg-brand-primary/50 text-brand-text/70 px-2 py-1 rounded-full">
                          Optional
                        </span>
                      </h3>
                      <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                        Connect your Top Shot account to your Flow wallet to enable external trading and access to Vaultopolis.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => window.location.href = '/guides/account-linking'}
                          className="inline-flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Follow the guide: Account Linking
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 4 */}
                <Card variant="elevated" padding="md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-text mb-2">
                        Swap NFT for TSHOT
                      </h3>
                      <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                        Use Vaultopolis to convert your NBA Top Shot Moments into TSHOT tokens for instant liquidity and trading opportunities.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => window.location.href = '/guides/nft-to-tshot'}
                          className="inline-flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Follow the guide: Swapping NFT for TSHOT
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Step 5 */}
                <Card variant="elevated" padding="md">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                      5
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-brand-text mb-2">
                        Swap TSHOT for NFT
                      </h3>
                      <p className="text-sm text-brand-text/80 mb-3 leading-relaxed">
                        Learn how to redeem your TSHOT tokens back into NBA Top Shot Moments when you want to withdraw specific assets.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => window.location.href = '/guides/tshot-to-nft'}
                          className="inline-flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Follow the guide: Swapping TSHOT for NFT
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Success Message */}
              <Card variant="secondary" padding="md" className="border-green-400/30 bg-green-500/10">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-200 mb-4">
                    You're All Set!
                  </h2>
                  <p className="text-green-200/80 leading-relaxed">
                    You now have everything you need to start using TSHOT. Whether you're depositing Moments, trading on DEXs, or redeeming for new gems, you're ready to explore the full potential of tokenized Top Shot liquidity on the Flow blockchain.
                  </p>
                </div>
              </Card>

              {/* Footer Info */}
              <Card variant="secondary" padding="md">
                <div className="text-center text-brand-text/70">
                  <p className="mb-4">
                    Vaultopolis is a decentralized platform that tokenizes Top Shot Moments into TSHOT, enabling instant bulk trading, yield opportunities, and seamless liquidity management.
                  </p>
                  <p className="text-sm">
                    Vaultopolis is not affiliated with Top Shot or Dapper Labs. All operations are executed through decentralized smart contracts.
                  </p>
                </div>
              </Card>
            </div>
          </ContentPanel>
        </PageWrapper>
      </div>
    </>
  );
}

export default QuickStartGuidePage;