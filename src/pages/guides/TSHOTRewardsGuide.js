import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import PageWrapper from "../../components/PageWrapper";
import ContentPanel from "../../components/ContentPanel";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Zap,
} from "lucide-react";
import { currentCampaign, getCampaignDurationText } from "../../config/rewardsCampaign";

function TSHOTRewardsGuide() {
  return (
    <>
      <Helmet>
        <title>Vaultopolis - TSHOT Rewards Program: How to Participate</title>
        <meta name="description" content="Learn how to participate in the TSHOT rewards program on Merkl. Guide for holding TSHOT on Flow EVM and claiming rewards." />
        <meta name="keywords" content="TSHOT rewards, Merkl campaign, Flow EVM rewards, rewards program, how to participate" />
        
        {/* Open Graph */}
        <meta property="og:title" content="TSHOT Rewards Program: How to Participate | Vaultopolis" />
        <meta property="og:description" content="Learn how to participate in the TSHOT rewards program on Merkl. Guide for holding TSHOT on Flow EVM." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://vaultopolis.com/guides/tshot-rewards" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="TSHOT Rewards Program: How to Participate | Vaultopolis" />
        <meta name="twitter:description" content="Learn how to participate in the TSHOT rewards program on Merkl." />
        
        {/* Canonical URL - points to disclosure page as canonical */}
        <link rel="canonical" href="https://vaultopolis.com/rewards/tshot" />
      </Helmet>

      <div className="w-full">
        {/* Breadcrumb Navigation */}
        <PageWrapper padding="sm">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-white/70">
              <li>
                <Link to="/guides" className="hover:text-opolis transition-colors flex items-center">
                  <BookOpen className="mr-1" size={14} />
                  Guides
                </Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-white">TSHOT Rewards Program</span>
              </li>
            </ol>
          </nav>
        </PageWrapper>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-opolis/20 via-opolis/10 to-opolis/5 pt-12 pb-16 px-2 sm:px-4 mb-6 border-b border-opolis/30">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6">
              <Zap className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-opolis" />
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {currentCampaign.name}: How to Participate
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6 leading-relaxed">
                {currentCampaign.totalRewards.toLocaleString()} FLOW distributed over {currentCampaign.durationWeeks} weeks to $TSHOT holders on Flow EVM
              </p>
              <p className="text-white/70 text-sm">
                Campaign runs {currentCampaign.startDate} - {currentCampaign.endDate}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <PageWrapper padding="md">
          {/* Disclosure Callout */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-brand-text mb-2">Important disclosure</h3>
            <p className="text-sm text-brand-text/90 mb-2">
              This page is a participation guide. Read the full program disclosures here:{" "}
              <Link to="/rewards/tshot" className="text-opolis hover:text-opolis/80 underline">
                /rewards/tshot
              </Link>
              .
            </p>
            <p className="text-sm text-brand-text/90 mb-2">
              The program is optional, may change or end at any time, and is not investment advice.
            </p>
            <p className="text-sm text-brand-text/90 mb-2">
              Nothing on this Site constitutes an offer or solicitation to buy or sell any asset.
            </p>
            <p className="text-sm text-brand-text/90">
              For the most current schedule and eligibility, refer to{" "}
              <a
                href={currentCampaign.merklUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-opolis hover:text-opolis/80 underline"
              >
                Merkl
              </a>
              .
            </p>
          </div>

          {/* Rewards Overview */}
          <ContentPanel title="Rewards Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card variant="elevated" padding="md">
                <h3 className="font-bold text-brand-text mb-3">Base Weekly Distribution</h3>
                <p className="text-3xl font-bold text-opolis mb-2">{currentCampaign.baseWeeklyAmount.toLocaleString()} FLOW</p>
                <p className="text-brand-text/70 text-sm mb-4">per week</p>
                <div className="bg-brand-secondary rounded p-3">
                  <p className="text-xs text-brand-text/80">
                    Claim your weekly distribution by connecting your wallet at merkl.xyz
                  </p>
                </div>
              </Card>

              <Card variant="elevated" padding="md">
                <h3 className="font-bold text-brand-text mb-3">Supercharged Weeks</h3>
                <p className="text-3xl font-bold text-opolis mb-2">{currentCampaign.superchargedAmount.toLocaleString()} FLOW</p>
                <p className="text-brand-text/70 text-sm mb-4">Base distribution × 2</p>
                <p className="text-brand-text/60 text-xs mb-3">
                  On supercharged weeks, the reward pool is doubled (base × 2).
                </p>
                <ul className="space-y-2 text-sm text-brand-text/80">
                  {currentCampaign.superchargedWeeks.map((week) => (
                    <li key={week.week} className="flex items-center">
                      <span className="text-opolis mr-2">🔥</span>
                      Week {week.week}: {week.name} ({week.dates})
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </ContentPanel>

          {/* How to Participate */}
          <ContentPanel title="How to Participate" className="mt-8">
            <div className="space-y-6">
              <Card variant="elevated" padding="md">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-opolis text-white flex items-center justify-center text-lg font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-text mb-2">
                      Bridge TSHOT to Flow EVM
                    </h3>
                    <p className="text-sm text-brand-text/80 mb-4 leading-relaxed">
                      To participate in the rewards program, you need to hold TSHOT on Flow EVM, not on Flow Cadence. 
                      If your TSHOT is currently on Flow Cadence, you'll need to bridge it first.
                    </p>
                    <Link to="/guides/tshot-bridging">
                      <Button variant="primary" size="sm" className="inline-flex items-center gap-2">
                        Read Bridging Guide
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-opolis text-white flex items-center justify-center text-lg font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-text mb-2">
                      Hold TSHOT on Flow EVM
                    </h3>
                    <p className="text-sm text-brand-text/80 mb-4 leading-relaxed">
                      Simply hold your TSHOT tokens in a Flow EVM compatible wallet. There's no staking, locking, 
                      or additional actions required. Just hold to be eligible for the rewards program.
                    </p>
                    <div className="bg-brand-secondary rounded p-3 mb-4">
                      <p className="text-xs text-brand-text/80">
                        <strong>Note:</strong> {currentCampaign.eligibility.excludedWallets.description} ({currentCampaign.eligibility.excludedWallets.amount.toLocaleString()} $TSHOT) are blacklisted from rewards. 
                        The entire {currentCampaign.totalRewards.toLocaleString()} $FLOW pool is distributed to an eligible supply of only ~{currentCampaign.eligibility.excludedWallets.eligibleSupply.toLocaleString()} $TSHOT.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-opolis text-white flex items-center justify-center text-lg font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-text mb-2">
                      Connect Your Wallet and Claim Distribution
                    </h3>
                    <p className="text-sm text-brand-text/80 mb-4 leading-relaxed">
                      Visit Merkl and connect your Flow EVM wallet to claim your share of the distribution pool. You can claim whenever you're ready.
                    </p>
                    <a 
                      href={currentCampaign.merklUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="primary" size="sm" className="inline-flex items-center gap-2">
                        View Rewards on Merkl
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </ContentPanel>

          {/* Important Notes */}
          <ContentPanel title="Important Information" className="mt-8">
            <Card variant="elevated" padding="md">
              <ul className="space-y-3 text-sm text-brand-text/80">
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    <strong>No staking required:</strong> Simply hold TSHOT on Flow EVM in your wallet to be eligible.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    <strong>Weekly distribution:</strong> Distributions occur weekly. You can claim whenever you're ready - no need to claim each week.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    <strong>Campaign duration:</strong> {getCampaignDurationText()}
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    <strong>Community focused:</strong> This program is exclusively for community holders. Team, treasury, and LP wallets are excluded from the program.
                  </span>
                </li>
              </ul>
            </Card>
          </ContentPanel>

          {/* Related Links */}
          <ContentPanel className="mt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-brand-text mb-4">
                Related Guides
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/guides/tshot-bridging">
                  <Button variant="secondary" size="md">
                    TSHOT Bridging Guide
                  </Button>
                </Link>
                <Link to="/tshot">
                  <Button variant="secondary" size="md">
                    What is TSHOT?
                  </Button>
                </Link>
              </div>
            </div>
          </ContentPanel>
        </PageWrapper>
      </div>
    </>
  );
}

export default TSHOTRewardsGuide;

