import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ExternalLink, CheckCircle } from "lucide-react";
import Button from "../components/Button";
import { currentCampaign, getCampaignDateRange } from "../config/rewardsCampaign";

function Rewards() {
  return (
    <>
      <Helmet>
        <title>Vaultopolis - TSHOT Rewards Program (Disclosure)</title>
        <meta
          name="description"
          content="TSHOT rewards program disclosure. Information about the limited-time rewards program for holding TSHOT on Flow EVM."
        />
        <meta name="keywords" content="TSHOT rewards, rewards program, Flow EVM, Merkl, incentives" />
        <link rel="canonical" href="https://vaultopolis.com/rewards/tshot" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="TSHOT Rewards Program (Disclosure) | Vaultopolis" />
        <meta property="og:description" content="TSHOT rewards program disclosure and information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/rewards/tshot" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="TSHOT Rewards Program (Disclosure) | Vaultopolis" />
        <meta name="twitter:description" content="TSHOT rewards program disclosure and information." />
      </Helmet>

      <div className="w-full min-h-screen bg-brand-background text-brand-text">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-brand-text/60 mb-2">Last Updated: {currentCampaign.lastUpdated}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-text mb-6">
              {currentCampaign.name} (Disclosure)
            </h1>
          </div>

          {/* Intro Block */}
          <div className="bg-brand-secondary rounded-lg p-6 mb-8 border border-brand-border">
            <p className="text-brand-text/90 mb-4 leading-relaxed">
              This page describes a limited-time rewards program related to holding $TSHOT on Flow EVM.
            </p>
            <p className="text-brand-text/90 mb-4 leading-relaxed">
              This program is optional, may change or end at any time, and is not a guarantee of future rewards.
            </p>
            <p className="text-brand-text/90 leading-relaxed">
              Nothing on this page is investment advice, and this program is not "yield", "interest", or an "APY".
            </p>
          </div>

          {/* Program Summary */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-text mb-4">Program Summary</h2>
            <div className="bg-brand-secondary rounded-lg p-6 border border-brand-border">
              <ul className="space-y-3 text-brand-text/90">
                <li>
                  <strong>Total rewards:</strong> {currentCampaign.totalRewards.toLocaleString()} FLOW over {currentCampaign.durationWeeks} weeks
                </li>
                <li>
                  <strong>Dates:</strong> {getCampaignDateRange()}
                </li>
                <li>
                  <strong>Weekly distribution:</strong> typically {currentCampaign.baseWeeklyAmount.toLocaleString()} FLOW (some weeks may differ)
                </li>
                <li>
                  <strong>Supercharged weeks:</strong> {currentCampaign.superchargedAmount.toLocaleString()} FLOW on:
                  <ul className="ml-6 mt-2 space-y-1">
                    {currentCampaign.superchargedWeeks.map((week) => (
                      <li key={week.week}>• Week {week.week}: {week.name} ({week.dates})</li>
                    ))}
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-text mb-4">Eligibility</h2>
            <div className="bg-brand-secondary rounded-lg p-6 border border-brand-border">
              <ul className="space-y-3 text-brand-text/90">
                <li>Hold $TSHOT on Flow EVM (no staking required).</li>
                <li>Rewards are tracked and claimed via Merkl.</li>
                <li>Certain addresses (including team/treasury/LP or other program-excluded wallets) may be ineligible.</li>
              </ul>
            </div>
          </section>

          {/* How to Claim */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-text mb-4">How to Claim</h2>
            <div className="bg-brand-secondary rounded-lg p-6 border border-brand-border">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <a
                  href={currentCampaign.merklUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="primary" className="inline-flex items-center gap-2">
                    View Rewards on Merkl
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
                <Link to="/guides/tshot-rewards">
                  <Button variant="secondary" className="inline-flex items-center gap-2">
                    How to Participate
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-brand-text/70">
                Eligibility calculations and distribution mechanics may be administered via third-party infrastructure (e.g., Merkl).
              </p>
            </div>
          </section>

          {/* Important Disclosures */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-brand-text mb-4">Important Disclosures</h2>
            <div className="bg-brand-secondary rounded-lg p-6 border border-brand-border">
              <ul className="space-y-3 text-brand-text/90">
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    Rewards are provided through a third-party program (Merkl). Vaultopolis does not guarantee availability, amounts, or timing.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    Reward amounts, eligibility rules, and program duration may be modified or paused.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    Digital assets are volatile; participating may involve market risk and bridging risk.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-opolis mr-2 mt-0.5 flex-shrink-0" size={18} />
                  <span>
                    You are responsible for compliance with your local laws and tax obligations.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Footer Note */}
          <div className="bg-brand-secondary rounded-lg p-6 border border-brand-border">
            <p className="text-sm text-brand-text/70 leading-relaxed">
              For smart-contract interactions, see{" "}
              <Link to="/terms" className="text-opolis hover:text-opolis/80 underline">
                Terms of Service
              </Link>
              . For website usage, see{" "}
              <Link to="/terms-of-use" className="text-opolis hover:text-opolis/80 underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-opolis hover:text-opolis/80 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Rewards;

