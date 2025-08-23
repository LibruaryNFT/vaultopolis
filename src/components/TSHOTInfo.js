import React from "react";
import {
  CircleDollarSign,
  ShieldCheck,
  Dice5,
  Globe2,
  Wrench,
  BarChart2,
  Network,
  BarChart,
  GitFork,
  ArrowDown,
  Replace,
  BookLock,
} from "lucide-react";

/* ---------- helpers ---------- */
const InfoCard = ({ icon: Icon, title, children, extraClass = "" }) => (
  <div className={`p-2 rounded-lg flex flex-col ${extraClass}`}>
    <div className="flex items-center text-base font-bold mb-1">
      <Icon className="w-5 h-5 mr-2" />
      {title}
    </div>
    <div className="flex flex-col flex-grow">{children}</div>
  </div>
);

const MobileAccordion = ({ icon: Icon, title, children }) => (
  <details className="md:hidden group border border-brand-border rounded w-full">
    <summary className="cursor-pointer select-none flex items-center justify-between bg-brand-primary px-2 py-1 font-semibold text-base text-brand-text rounded w-full">
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2" /> {title}
      </div>
      <span className="transition-transform group-open:rotate-180">▼</span>
    </summary>
    <div className="mt-1 px-2 pb-1">{children}</div>
  </details>
);

const DesktopSection = ({ icon: Icon, title, children }) => (
  <div className="hidden md:block">
    <div className="max-w-6xl mx-auto grid md:grid-cols-[160px_1fr] gap-2">
      <div className="text-right pt-2">
        <span className="inline-flex items-center bg-brand-primary text-brand-text px-2 py-1 rounded">
          <Icon className="w-5 h-5 mr-2" /> {title}
        </span>
      </div>
      {children}
    </div>
  </div>
);

/* ---------- main component ---------- */
function TSHOTInfo({ vaultSummary, loading, error }) {
  /* Grids */

  const userJourneyGrid = (
    <div>
      <p className="text-center text-sm text-brand-text/80 mb-6 max-w-2xl mx-auto">
        Whether you're a Top Shot collector or a crypto trader, there's a path
        for you.
      </p>
      
      {/* GET TSHOT */}
      <div className="border-2 border-brand-border rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-center mb-4 text-brand-text">GET TSHOT</h3>
        <p className="text-center text-sm text-brand-text/80 mb-6 max-w-2xl mx-auto">
          There are two ways to get TSHOT, depending on what you already have.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Start with Moments */}
          <div className="bg-brand-primary/50 p-3 rounded-lg border border-brand-border">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <img
                src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png"
                alt="TopShot"
                className="h-7 w-7 object-contain"
              />
              Start with Moments
            </h3>
            <p className="text-xs sm:text-sm text-brand-text/80 mb-2">
              The primary way to get TSHOT. Deposit any Moment you own to mint (create) exactly one TSHOT token (1:1).
            </p>
            <div className="space-y-2">
              <a
                href="https://vaultopolis.com"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-400 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2 text-xs sm:text-sm"
              >
                <img
                  src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
                  alt="Vaultopolis"
                  className="h-4 w-4"
                />
                Launch App
              </a>
              <a
                href="/guides/nft-to-tshot"
                className="bg-brand-primary hover:bg-brand-primary/80 text-brand-text px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2 text-xs sm:text-sm border border-brand-border"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                NFT to TSHOT Guide
              </a>
            </div>
          </div>

          {/* Start with Crypto */}
          <div className="bg-brand-primary/50 p-3 rounded-lg border border-brand-border">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <img
                src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg"
                alt="Flow"
                className="h-7 w-7 object-contain"
              />
              Start with Crypto
            </h3>
            <p className="text-xs sm:text-sm text-brand-text/80 mb-2">
              Alternatively, if you're familiar with DeFi, you can swap FLOW for TSHOT on a decentralized exchange.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href="https://app.increment.fi/swap?in=A.1654653399040a61.FlowToken&out=A.05b67ba314000b2d.TSHOT"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-400 hover:bg-blue-600 text-white px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <img
                  src="https://www.increment.fi/favicon.ico"
                  alt="Increment.fi"
                  className="h-4 w-4"
                />
                Increment.fi
              </a>
              <a
                href="https://swap.kittypunch.xyz/?tokens=0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e-0xc618a7356fcf601f694c51578cd94144deaee690"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-400 hover:bg-blue-600 text-white px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <img
                  src="https://swap.kittypunch.xyz/Punch1.png"
                  alt="PunchSwap"
                  className="h-4 w-4"
                />
                PunchSwap
              </a>
            </div>
          </div>
        </div>
        
        {/* Need a Walkthrough? */}
        <div className="text-center">
          <p className="text-sm text-brand-text/80 mb-3">
            Need a Walkthrough?
          </p>
          <p className="text-xs text-brand-text/60 mb-4">
            Our complete guide is the best place to start.
          </p>
          <a
            href="/guides/quick-start"
            className="bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm font-medium mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View the Full Quick Start Guide
          </a>
        </div>
        
        {/* Scroll Cue */}
        <div className="text-center mt-6">
          <div className="text-brand-text/40 text-xs mb-2">Discover what you can do with TSHOT</div>
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-brand-text/30 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      {/* USE TSHOT */}
      <div className="border-2 border-brand-border rounded-lg p-4 mb-6">
        <h3 className="text-lg font-bold text-center mb-4 text-brand-text">USE TSHOT</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoCard
            icon={Dice5}
            title="Swap for Moments"
            extraClass="border border-brand-border"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="h-7 w-7 object-contain"
              />
              <svg
                className="w-8 h-8 text-brand-text/50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12h16" />
                <path d="M4 12l4 4" />
                <path d="M4 12l4-4" />
                <path d="M20 12l-4 4" />
                <path d="M20 12l-4-4" />
              </svg>
              <img
                src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png"
                alt="TopShot"
                className="h-7 w-7 object-contain"
              />
            </div>
            <p className="text-xs sm:text-sm text-brand-text/80 mb-2 flex-grow">
              Swap your TSHOT tokens 1-for-1 to get a random NBA Top Shot Moment from the vault. It's a 24/7 treasure hunt for gems.
            </p>
            <div className="space-y-2">
              <a
                href="https://vaultopolis.com"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-400 hover:bg-blue-600 text-white mt-auto px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <img
                  src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
                  alt="Vaultopolis"
                  className="h-4 w-4"
                />
                Launch App
              </a>
              <a
                href="/guides/tshot-to-nft"
                className="bg-brand-primary hover:bg-brand-primary/80 text-brand-text px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm border border-brand-border"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                TSHOT to NFT Guide
              </a>
            </div>
          </InfoCard>
          <InfoCard
            icon={CircleDollarSign}
            title="Earn Passive Yield"
            extraClass="border border-brand-border"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="h-7 w-7 object-contain"
              />
              <span className="text-brand-text/50 text-xl">+</span>
              <img
                src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg"
                alt="Flow"
                className="h-7 w-7 object-contain"
              />
            </div>
            <p className="text-xs sm:text-sm text-brand-text/80 mb-2 flex-grow">
              Provide liquidity by pairing TSHOT with FLOW on a DEX to earn
              passive income from trading fees.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
              <a
                href="https://app.increment.fi/liquidity/add"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-400 hover:bg-blue-600 text-white px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <img
                  src="https://www.increment.fi/favicon.ico"
                  alt="Increment.fi"
                  className="h-4 w-4"
                />
                Increment.fi
              </a>
              <a
                href="https://swap.kittypunch.xyz/?tab=liquidity&mode=add&token0=0xC618a7356FcF601f694C51578CD94144Deaee690&token1=0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-400 hover:bg-blue-600 text-white px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <img
                  src="https://swap.kittypunch.xyz/Punch1.png"
                  alt="PunchSwap"
                  className="h-4 w-4"
                />
                PunchSwap
              </a>
            </div>
          </InfoCard>
          <InfoCard
            icon={BarChart2}
            title="Wager on FastBreak"
            extraClass="border border-brand-border"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="h-7 w-7 object-contain"
              />
              <svg
                className="w-8 h-8 text-brand-text/50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
              <img
                src="https://www.aisportspro.com/ais_logo_new.svg"
                alt="aiSports"
                className="h-11 w-11 object-contain"
              />
            </div>
            <p className="text-xs sm:text-sm text-brand-text/80 mb-2 flex-grow">
              Use TSHOT to enter wagering contests for Top Shot FastBreak and
              compete for prize pools.
            </p>
            <a
              href="https://www.aisportspro.com/fastbreak"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center text-xs sm:text-sm"
            >
              aiSports FastBreak
            </a>
          </InfoCard>
        </div>
      </div>
    </div>
  );

  const coreMechanicsGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      <InfoCard
        icon={Replace}
        title="Guaranteed 1-for-1 Swaps"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80">
          The process is a two-way street: you can always swap any Moment to receive exactly one TSHOT, and you can always swap one TSHOT back to receive a random Moment from the vault.
        </p>
      </InfoCard>
      <InfoCard
        icon={Dice5}
        title="The 24/7 Treasure Hunt"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80">
          Every swap for a Moment is completely random and verifiably fair, using Flow's on-chain technology. This means your single TSHOT could be exchanged for any of the thousands of Moments currently in the vault, giving everyone an equal chance to discover a hidden gem.
        </p>
      </InfoCard>
      <InfoCard
        icon={Globe2}
        title="Dapper Wallet Integration"
        extraClass="bg-brand-primary"
      >
        <div className="flex flex-col flex-grow">
          <p className="text-xs text-brand-text/80 flex-grow">
            Seamlessly use your existing Dapper Wallet to swap Moments to and from your wallet. No need to create new accounts or transfer assets.
          </p>
          <div className="mt-2">
            <a
              href="/guides/account-linking"
              className="bg-brand-primary hover:bg-brand-primary/80 text-brand-text px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2 text-xs border border-brand-border"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Account Linking Guide
            </a>
          </div>
        </div>
      </InfoCard>
      <InfoCard
        icon={BarChart}
        title="Key Statistics"
        extraClass="bg-brand-primary col-span-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-brand-text">
              April 17th, 2025
            </p>
            <p className="text-xs text-brand-text/80">Launch Date</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-text">4M+</p>
            <p className="text-xs text-brand-text/80">Moments Exchanged</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-text">
              {loading ? (
                <span className="text-brand-text/60">Loading...</span>
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : vaultSummary?.total ? (
                vaultSummary.total.toLocaleString()
              ) : (
                "..."
              )}
            </p>
            <p className="text-xs text-brand-text/80">Moments in Vault</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-brand-text">300+</p>
            <p className="text-xs text-brand-text/80">Active Users</p>
          </div>
        </div>
      </InfoCard>
    </div>
  );

  const trustAndSecurityGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      <InfoCard
        icon={ShieldCheck}
        title="Secure Smart Contract"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80">
          Built on Flow's secure blockchain with comprehensive security measures
          and regular audits to protect your assets.
        </p>
      </InfoCard>
      <InfoCard
        icon={Dice5}
        title="Fair & Random Swaps"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80 flex-grow">
          Redemptions use Flow's Verifiable Random Function (VRF) to ensure fair
          and tamper-proof selection of Moments. The randomness is generated
          on-chain and can be verified by anyone.
        </p>
        <div className="mt-2">
          <a
            href="https://developers.flow.com/build/advanced-concepts/randomness"
            target="_blank"
            rel="noreferrer"
            className="bg-brand-primary hover:bg-brand-primary/80 text-brand-text px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2 text-xs border border-brand-border"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Randomness on FLOW
          </a>
        </div>
      </InfoCard>
      <InfoCard
        icon={BookLock}
        title="Audited & Verifiable"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80 flex-grow">
          Built with security best practices and undergoing regular audits.
          Anyone can inspect the contract on the Flow blockchain.
        </p>
        <div className="mt-2">
          <a
            href="https://www.flowscan.io/contract/A.05b67ba314000b2d.TSHOTExchange?tab=deployments"
            target="_blank"
            rel="noreferrer"
            className="bg-brand-primary hover:bg-brand-primary/80 text-brand-text px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-2 text-xs border border-brand-border"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Contract
          </a>
        </div>
      </InfoCard>
    </div>
  );

  const ecosystemGrid = (
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
        <p className="text-xs font-semibold text-brand-text/80">
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
            className="h-8"
          />
        </div>
        <p className="text-xs font-semibold text-brand-text/80">
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
        <p className="text-xs font-semibold text-brand-text/80">
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
        <p className="text-xs font-semibold text-brand-text/80">
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
        <p className="text-xs font-semibold text-brand-text/80">
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
            className="h-10"
          />
        </div>
        <p className="text-xs font-semibold text-brand-text/80">
          Wager on aiSports
        </p>
      </a>
    </div>
  );

  return (
    <div className="text-brand-text">
      {/* ---------- Hero Section ---------- */}
      <div className="bg-gradient-to-b from-brand-primary to-brand-secondary pt-2 px-3 pb-8">
        <div className="max-w-6xl mx-auto md:pl-[160px] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
              TSHOT
              <br />
              Tokenized Top Shot Liquidity on Flow
            </h1>
            <p className="text-sm sm:text-base text-brand-text/80 max-w-xl">
              The liquid token for your NBA Top Shot collection. Instantly swap Moments 1-for-1 to mint TSHOT, then swap TSHOT back for random Moments from the vault. Unlock bulk trading, yield, and more.
            </p>
            <div className="mt-4">
              <a
                href="/"
                className="bg-opolis hover:bg-opolis-dark text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <img
                  src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
                  alt="Vaultopolis"
                  className="h-5 w-5"
                />
                Launch App
              </a>
            </div>
          </div>
          <div className="flex justify-center md:justify-start md:ml-2 order-1 md:order-2">
            <img
              src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
              alt="TSHOT Icon"
              className="w-36 h-36 sm:w-48 sm:h-48 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Sections Wrapper */}
      <div className="space-y-1 mt-2 px-2">
        {/* How to Get Started Section */}
        <div>
          <MobileAccordion icon={GitFork} title="How to Get Started">
            <div className="bg-brand-primary rounded-lg p-4">
              {userJourneyGrid}
            </div>
          </MobileAccordion>
          <DesktopSection icon={GitFork} title="How to Get Started">
            <div className="bg-brand-primary rounded-lg p-4">
              {userJourneyGrid}
            </div>
          </DesktopSection>
        </div>

        {/* Core Mechanics Section */}
        <div>
          <MobileAccordion icon={Wrench} title="Core Mechanics">
            <div className="rounded-lg p-2 bg-brand-primary/10 [background-image:url('data:image/svg+xml,%3Csvg_width%3D%2240%22_height%3D%2240%22_viewBox%3D%220_0_40_40%22_xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_fill-rule%3D%22evenodd%22%3E%3Cpath_d%3D%22M0_40L40_0H20L0_20M40_40V20L20_40%22/%3E%3C/g%3E%3C/svg%3E')]">
              {coreMechanicsGrid}
            </div>
          </MobileAccordion>
          <DesktopSection icon={Wrench} title="Core Mechanics">
            <div className="rounded-lg p-2 bg-brand-primary/10 [background-image:url('data:image/svg+xml,%3Csvg_width%3D%2240%22_height%3D%2240%22_viewBox%3D%220_0_40_40%22_xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_fill-rule%3D%22evenodd%22%3E%3Cpath_d%3D%22M0_40L40_0H20L0_20M40_40V20L20_40%22/%3E%3C/g%3E%3C/svg%3E')]">
              {coreMechanicsGrid}
            </div>
          </DesktopSection>
        </div>

        {/* Trust & Security Section */}
        <div>
          <MobileAccordion icon={ShieldCheck} title="Trust & Security">
            <div className="rounded-lg p-2 bg-brand-primary/10 [background-image:url('data:image/svg+xml,%3Csvg_xmlns%3D%22http%3A//www.w3.org/2000/svg%22_width%3D%2228%22_height%3D%2228%22_viewBox%3D%220_0_28_28%22%3E%3Cpath_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_d%3D%22M14_0_C6.268_0_0_6.268_0_14s6.268_14_14_14_14-6.268_14-14S21.732_0_14_0zM7_14c0-3.86_3.14-7_7-7s7_3.14_7_7-3.14_7-7_7-7-3.14-7-7z%22/%3E%3C/svg%3E')]">
              {trustAndSecurityGrid}
            </div>
          </MobileAccordion>
          <DesktopSection icon={ShieldCheck} title="Trust & Security">
            <div className="rounded-lg p-2 bg-brand-primary/10 [background-image:url('data:image/svg+xml,%3Csvg_xmlns%3D%22http%3A//www.w3.org/2000/svg%22_width%3D%2228%22_height%3D%2228%22_viewBox%3D%220_0_28_28%22%3E%3Cpath_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_d%3D%22M14_0_C6.268_0_0_6.268_0_14s6.268_14_14_14_14-6.268_14-14S21.732_0_14_0zM7_14c0-3.86_3.14-7_7-7s7_3.14_7_7-3.14_7-7_7-7-3.14-7-7z%22/%3E%3C/svg%3E')]">
              {trustAndSecurityGrid}
            </div>
          </DesktopSection>
        </div>

        {/* Ecosystem Section */}
        <div>
          <MobileAccordion icon={Network} title="Ecosystem">
            <div className="rounded-lg p-2 bg-brand-primary [background-image:url('data:image/svg+xml,%3Csvg_xmlns%3D%22http%3A//www.w3.org/2000/svg%22_width%3D%2228%22_height%3D%2228%22_viewBox%3D%220_0_28_28%22%3E%3Cpath_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_d%3D%22M14_0_C6.268_0_0_6.268_0_14s6.268_14_14_14_14-6.268_14-14S21.732_0_14_0zM7_14c0-3.86_3.14-7_7-7s7_3.14_7_7-3.14_7-7_7-7-3.14-7-7z%22/%3E%3C/svg%3E')]">
              {ecosystemGrid}
            </div>
          </MobileAccordion>
          <DesktopSection icon={Network} title="Ecosystem">
            <div className="rounded-lg p-2 bg-brand-primary [background-image:url('data:image/svg+xml,%3Csvg_xmlns%3D%22http%3A//www.w3.org/2000/svg%22_width%3D%2228%22_height%3D%2228%22_viewBox%3D%220_0_28_28%22%3E%3Cpath_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_d%3D%22M14_0_C6.268_0_0_6.268_0_14s6.268_14_14_14_14-6.268_14-14S21.732_0_14_0zM7_14c0-3.86_3.14-7_7-7s7_3.14_7_7-3.14_7-7_7-7-3.14-7-7z%22/%3E%3C/svg%3E')]">
              {ecosystemGrid}
            </div>
          </DesktopSection>
        </div>
      </div>
    </div>
  );
}

export default TSHOTInfo;