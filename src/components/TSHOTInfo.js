import React from "react";
import {
  Repeat,
  CircleDollarSign,
  ShieldCheck,
  Dice5,
  Globe2,
} from "lucide-react";

/* ---------- helpers ---------- */
const InfoCard = ({ icon: Icon, title, children, extraClass = "" }) => (
  <div className={`p-3 rounded-lg ${extraClass}`}>
    <div className="flex items-center text-base font-bold mb-1">
      <Icon className="w-5 h-5 mr-2" />
      {title}
    </div>
    {children}
  </div>
);

const SectionShell = ({ children }) => (
  <section className="px-2 md:px-3">{children}</section>
);

const MobileAccordion = ({ title, children }) => (
  <details className="md:hidden group border border-brand-border rounded">
    <summary className="cursor-pointer select-none flex items-center justify-between bg-brand-primary px-2 py-1 font-semibold text-base text-brand-text rounded">
      {title}
      <span className="transition-transform group-open:rotate-180">▼</span>
    </summary>
    <div className="mt-2 px-2 pb-2">{children}</div>
  </details>
);

const DesktopSection = ({ title, children }) => (
  <div className="hidden md:block">
    <div className="max-w-6xl mx-auto grid md:grid-cols-[160px_1fr] gap-2">
      <div className="text-right mt-[0.75rem]">
        <span className="inline-block bg-brand-primary text-brand-text px-2 py-1 rounded">
          {title}
        </span>
      </div>
      {children}
    </div>
  </div>
);

/* ---------- main component ---------- */
function TSHOTInfo() {
  /* grids (unchanged) */
  const coreMechanicsGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* cards… */}
      <InfoCard
        icon={ShieldCheck}
        title="Convert Moments to TSHOT"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80">
          Deposit Moments 1-for-1 to receive TSHOT.
        </p>
      </InfoCard>
      <InfoCard
        icon={Dice5}
        title="Convert TSHOT to Moments"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80">
          Redeem TSHOT for random Moments from the Vault.
        </p>
      </InfoCard>
      <InfoCard
        icon={Repeat}
        title="Use Dapper Wallet Moments"
        extraClass="bg-brand-primary"
      >
        <div className="flex sm:flex-nowrap items-center gap-2 text-xs text-brand-text/80">
          <span className="sm:flex-grow">
            Seamlessly leverage Moments stored in your Dapper Wallet.
          </span>
          <a
            href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded whitespace-nowrap"
          >
            Learn&nbsp;More
          </a>
        </div>
      </InfoCard>
    </div>
  );

  const benefitsGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* BUY FAST */}
      <InfoCard
        icon={Globe2}
        title="Buy Moments Fast"
        extraClass="bg-brand-primary flex flex-col"
      >
        <p className="text-xs text-brand-text/80 mb-1">
          Pick up TSHOT on a DEX, then convert to random Moments inside
          Vaultopolis.
        </p>
        <div className="flex flex-col gap-1">
          {[
            [
              "https://app.increment.fi/swap?in=A.1654653399040a61.FlowToken&out=A.05b67ba314000b2d.TSHOT",
              "FLOW → TSHOT • Increment.fi",
            ],
            [
              "https://swap.kittypunch.xyz/?tokens=0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e-0xc618a7356fcf601f694c51578cd94144deaee690",
              "FLOW → TSHOT • PunchSwap",
            ],
            ["/swap", "TSHOT → Moments • Vaultopolis"],
          ].map(([href, label]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="bg-purple-600 hover:bg-purple-700 text-xs text-white font-bold py-1.5 px-3 rounded"
            >
              {label}
            </a>
          ))}
        </div>
      </InfoCard>

      {/* SELL FAST */}
      <InfoCard
        icon={Globe2}
        title="Sell Moments Fast"
        extraClass="bg-brand-primary flex flex-col"
      >
        <p className="text-xs text-brand-text/80 mb-1">
          Swap Moments for TSHOT, then trade TSHOT for FLOW or any token.
        </p>
        <div className="flex flex-col gap-1">
          {[
            ["/swap", "Moments → TSHOT • Vaultopolis"],
            [
              "https://app.increment.fi/swap?in=A.05b67ba314000b2d.TSHOT&out=A.1654653399040a61.FlowToken",
              "TSHOT → FLOW • Increment.fi",
            ],
            [
              "https://swap.kittypunch.xyz/?tokens=0xc618a7356fcf601f694c51578cd94144deaee690-0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e",
              "TSHOT → FLOW • PunchSwap",
            ],
          ].map(([href, label]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="bg-purple-600 hover:bg-purple-700 text-xs text-white font-bold py-1.5 px-3 rounded"
            >
              {label}
            </a>
          ))}
        </div>
      </InfoCard>

      {/* YIELD */}
      <InfoCard
        icon={CircleDollarSign}
        title="Earn Passive Yield"
        extraClass="bg-brand-primary flex flex-col"
      >
        <p className="text-xs text-brand-text/80 mb-1">
          Provide TSHOT liquidity to earn rewards.
        </p>
        <div className="flex flex-col gap-1">
          {[
            [
              "https://app.increment.fi/liquidity/add",
              "Add Liquidity • Increment.fi",
            ],
            [
              "https://swap.kittypunch.xyz/?tab=liquidity&mode=add&token0=0xC618a7356FcF601f694C51578CD94144Deaee690&token1=0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e",
              "Add Liquidity • PunchSwap",
            ],
          ].map(([href, label]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white py-1.5 px-3 rounded"
            >
              {label}
            </a>
          ))}
        </div>
      </InfoCard>
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className="text-brand-text">
      {/* HERO */}
      <div className="bg-gradient-to-b from-brand-primary to-brand-secondary pt-3 pb-1 px-3">
        <div className="max-w-6xl mx-auto md:pl-[160px] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
              TSHOT
              <br />
              Tokenized Top Shot Liquidity on Flow
            </h1>
            <p className="text-sm sm:text-base text-brand-text/80 max-w-xl">
              <strong>TSHOT</strong> is a fungible token backed 1-for-1 by NBA
              Top Shot Moments. Deposit Moments to mint TSHOT, or redeem TSHOT
              for random Moments. Instant bulk trading, yield, and more.
            </p>
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

      {/* CORE MECHANICS & BENEFITS */}
      {/* space-y-3 mobile | space-y-1 desktop */}
      <div className="space-y-3 md:space-y-1">
        <SectionShell>
          <MobileAccordion title="Core Mechanics">
            <div className="rounded-lg p-3 bg-brand-primary/10">
              {coreMechanicsGrid}
            </div>
          </MobileAccordion>
          <DesktopSection title="Core Mechanics">
            <div className="rounded-lg p-3 bg-brand-primary/10">
              {coreMechanicsGrid}
            </div>
          </DesktopSection>
        </SectionShell>

        <SectionShell>
          <MobileAccordion title="Benefits">
            <div className="rounded-lg p-3 bg-brand-primary/10">
              {benefitsGrid}
            </div>
          </MobileAccordion>
          <DesktopSection title="Benefits">
            <div className="rounded-lg p-3 bg-brand-primary/10">
              {benefitsGrid}
            </div>
          </DesktopSection>
        </SectionShell>
      </div>
    </div>
  );
}

export default TSHOTInfo;
