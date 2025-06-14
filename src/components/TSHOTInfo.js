import React from "react";
import {
  Repeat,
  CircleDollarSign,
  ShieldCheck,
  Dice5,
  Globe2,
  ShieldQuestion,
  Info,
  Wrench,
  BarChart2,
  Network, // Using Network for Ecosystem section
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

const Tooltip = ({ text, children }) => (
  <span className="relative group">
    {children}
    <span className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none left-1/2 -translate-x-1/2">
      {text}
    </span>
  </span>
);

const SectionShell = ({ children, extraClass = "" }) => (
  <section className={`px-2 md:px-3 ${extraClass}`}>{children}</section>
);

const MobileAccordion = ({ icon: Icon, title, children }) => (
  <details className="md:hidden group border border-brand-border rounded">
    <summary className="cursor-pointer select-none flex items-center justify-between bg-brand-primary px-2 py-1 font-semibold text-base text-brand-text rounded">
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
function TSHOTInfo() {
  /* Grids */
  const coreMechanicsGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
        icon={ShieldQuestion}
        title="Fair & Random Redemptions"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80 flex-grow">
          Redemptions use Flow's on-chain{" "}
          <Tooltip text="Verifiable Random Function: A cryptographic method that ensures randomness is provably fair and tamper-proof.">
            <span className="font-bold underline decoration-dotted cursor-help">
              VRF
            </span>
          </Tooltip>{" "}
          to ensure the selection of Moments is fair.
        </p>
        <div className="mt-2">
          <a
            href="https://developers.flow.com/build/advanced-concepts/randomness"
            target="_blank"
            rel="noreferrer"
            className="bg-brand-secondary hover:bg-brand-secondary/60 text-white px-3 py-1 rounded-lg transition-colors text-sm"
          >
            Learn&nbsp;More
          </a>
        </div>
      </InfoCard>
      <InfoCard
        icon={Repeat}
        title="Use Dapper Wallet Moments"
        extraClass="bg-brand-primary"
      >
        <div className="flex flex-col flex-grow">
          <p className="text-xs text-brand-text/80 flex-grow">
            Seamlessly leverage Moments stored in your Dapper Wallet.
          </p>
          <div className="mt-2">
            <a
              href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
              target="_blank"
              rel="noreferrer"
              className="bg-brand-secondary hover:bg-brand-secondary/60 text-white px-3 py-1 rounded-lg transition-colors text-sm"
            >
              Learn&nbsp;More
            </a>
          </div>
        </div>
      </InfoCard>
    </div>
  );

  const benefitsGrid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      <InfoCard
        icon={Globe2}
        title="Buy Moments Fast"
        extraClass="bg-brand-primary"
      >
        <div className="text-xs text-brand-text/80 space-y-2">
          <div>
            <p className="font-semibold text-brand-text/90 mb-1">
              Step 1: Purchase TSHOT on a Trading Platform
            </p>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg"
                alt="Flow"
                className="h-8 w-8"
              />
              <span className="text-brand-text/70 text-lg">→</span>
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="w-8 h-8"
              />
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://app.increment.fi/swap?in=A.1654653399040a61.FlowToken&out=A.05b67ba314000b2d.TSHOT"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <img
                    src="https://www.increment.fi/favicon.ico"
                    alt="Increment.fi"
                    className="h-4 w-4"
                  />
                  Increment.fi (Cadence)
                </a>
                <a
                  href="https://swap.kittypunch.xyz/?tokens=0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e-0xc618a7356fcf601f694c51578cd94144deaee690"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <img
                    src="https://swap.kittypunch.xyz/Punch1.png"
                    alt="PunchSwap"
                    className="h-4 w-4"
                  />
                  PunchSwap (EVM)
                </a>
              </div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-brand-text/90 mb-1">
              Step 2: Swap for Moments
            </p>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png"
                alt="TopShot"
                className="h-8 w-8 object-contain"
              />
              <span className="text-brand-text/70 text-lg">→</span>
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="w-8 h-8"
              />
            </div>
            <a
              href="/"
              className="bg-brand-secondary hover:bg-brand-secondary/40 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <img
                src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
                alt="Vaultopolis"
                className="h-8 w-8 object-contain"
              />
              Vaultopolis
            </a>
          </div>
        </div>
      </InfoCard>
      <InfoCard
        icon={Globe2}
        title="Sell Moments Fast"
        extraClass="bg-brand-primary"
      >
        <div className="text-xs text-brand-text/80 space-y-2">
          <div>
            <p className="font-semibold text-brand-text/90 mb-1">
              Step 1: Swap Moments for TSHOT
            </p>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://support.nbatopshot.com/hc/article_attachments/5907379633299.png"
                alt="TopShot"
                className="h-8 w-8 object-contain"
              />
              <span className="text-brand-text/70 text-lg">→</span>
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="w-8 h-8"
              />
            </div>
            <a
              href="/"
              className="bg-brand-secondary hover:bg-brand-secondary/40 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <img
                src="https://storage.googleapis.com/vaultopolis/VaultopolisIcon.png"
                alt="Vaultopolis"
                className="h-8 w-8 object-contain"
              />
              Vaultopolis
            </a>
          </div>
          <div>
            <p className="font-semibold text-brand-text/90 mb-1">
              Step 2: Trade TSHOT on a DEX
            </p>
            <div className="flex items-center gap-2 mb-2">
              <img
                src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                alt="TSHOT"
                className="w-8 h-8"
              />
              <span className="text-brand-text/70 text-lg">→</span>
              <img
                src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg"
                alt="Flow"
                className="h-8 w-8"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://app.increment.fi/swap?in=A.05b67ba314000b2d.TSHOT&out=A.1654653399040a61.FlowToken"
                target="_blank"
                rel="noreferrer"
                className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <img
                  src="https://www.increment.fi/favicon.ico"
                  alt="Increment.fi"
                  className="h-4 w-4"
                />
                Increment.fi (Cadence)
              </a>
              <a
                href="https://swap.kittypunch.xyz/?tokens=0xc618a7356fcf601f694c51578cd94144deaee690-0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e"
                target="_blank"
                rel="noreferrer"
                className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <img
                  src="https://swap.kittypunch.xyz/Punch1.png"
                  alt="PunchSwap"
                  className="h-4 w-4"
                />
                PunchSwap (EVM)
              </a>
            </div>
            <div className="flex items-start bg-brand-primary/20 p-1.5 rounded text-left gap-1 mt-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-brand-text/80">
                TSHOT must be bridged to Flow EVM first using your Flow Wallet.
              </p>
            </div>
          </div>
        </div>
      </InfoCard>
      <InfoCard
        icon={CircleDollarSign}
        title="Earn Passive Yield"
        extraClass="bg-brand-primary"
      >
        <p className="text-xs text-brand-text/80 mb-2">
          Provide TSHOT liquidity on a DEX to earn trading fees and other
          rewards.
        </p>
        <div className="flex items-center gap-2 mb-2">
          <img
            src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
            alt="TSHOT"
            className="w-8 h-8"
          />
          <span className="text-brand-text/70 text-lg">+</span>
          <img
            src="https://cdn.prod.website-files.com/5f734f4dbd95382f4fdfa0ea/67e1750c3eb15026e1ca6618_Flow_Icon_Color.svg"
            alt="Flow"
            className="h-8 w-8"
          />
        </div>
        <div className="text-xs text-brand-text/80 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://app.increment.fi/liquidity/add"
              target="_blank"
              rel="noreferrer"
              className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <img
                src="https://www.increment.fi/favicon.ico"
                alt="Increment.fi"
                className="h-4 w-4"
              />
              Increment.fi (Cadence)
            </a>
            <a
              href="https://swap.kittypunch.xyz/?tab=liquidity&mode=add&token0=0xC618a7356FcF601f694C51578CD94144Deaee690&token1=0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e"
              target="_blank"
              rel="noreferrer"
              className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <img
                src="https://swap.kittypunch.xyz/Punch1.png"
                alt="PunchSwap"
                className="h-4 w-4"
              />
              PunchSwap (EVM)
            </a>
          </div>
        </div>
      </InfoCard>
      <InfoCard
        icon={BarChart2}
        title="Wager on TopShot FastBreak"
        extraClass="bg-brand-primary"
      >
        <div className="text-xs text-brand-text/80 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <img
              src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
              alt="TSHOT"
              className="w-8 h-8"
            />
            <span className="text-brand-text/70 text-lg">→</span>
            <img
              src="https://www.aisportspro.com/ais_logo_new.svg"
              alt="aiSports"
              className="h-8 w-8 object-contain"
            />
          </div>
          <p>
            Use TSHOT to wager on your FastBreak lineups. Enter the shared prize
            pool and split winnings with other successful entries.
          </p>
          <a
            href="https://www.aisportspro.com/fastbreak"
            target="_blank"
            rel="noreferrer"
            className="bg-brand-secondary hover:bg-brand-secondary/80 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <img
              src="https://www.aisportspro.com/ais_logo_new.svg"
              alt="aiSports"
              className="h-8 w-8 object-contain"
            />
            aiSports FastBreak
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
        <p className="text-xs font-semibold text-brand-text/80">TopShot</p>
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
          Use on aiSports
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
            alt="Increment.fi Logo"
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
    </div>
  );

  return (
    <div className="text-brand-text">
      <div className="bg-gradient-to-b from-brand-primary to-brand-secondary pt-2 px-3">
        <div className="max-w-6xl mx-auto md:pl-[160px] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
              TSHOT
              <br />
              Tokenized Top Shot Liquidity on Flow
            </h1>
            <p className="text-sm sm:text-base text-brand-text/80 max-w-xl">
              <strong>TSHOT</strong> is a fungible token backed 1-for-1 by Top
              Shot Moments. Deposit Moments to mint TSHOT in Vaultopolis, or
              redeem TSHOT for random Moments. Instant bulk trading, yield, and
              more.
            </p>
            <div className="mt-4">
              <a
                href="/"
                className="bg-opolis hover:bg-opolis-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
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

      <div className="space-y-2 md:space-y-1 py-4">
        <SectionShell>
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
        </SectionShell>

        <SectionShell>
          <MobileAccordion icon={BarChart2} title="Benefits">
            <div className="rounded-lg p-2 bg-brand-primary/10 [background-image:url('data:image/svg+xml,%3Csvg_xmlns%3D%22http%3A//www.w3.org/2000/svg%22_width%3D%2228%22_height%3D%2228%22_viewBox%3D%220_0_28_28%22%3E%3Cpath_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_d%3D%22M14_0_C6.268_0_0_6.268_0_14s6.268_14_14_14_14-6.268_14-14S21.732_0_14_0zM7_14c0-3.86_3.14-7_7-7s7_3.14_7_7-3.14_7-7_7-7-3.14-7-7z%22/%3E%3C/svg%3E')]">
              {benefitsGrid}
            </div>
          </MobileAccordion>
          <DesktopSection icon={BarChart2} title="Benefits">
            <div className="rounded-lg p-2 bg-brand-primary/10 [background-image:url('data:image/svg+xml,%3Csvg_xmlns%3D%22http%3A//www.w3.org/2000/svg%22_width%3D%2228%22_height%3D%2228%22_viewBox%3D%220_0_28_28%22%3E%3Cpath_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22_d%3D%22M14_0_C6.268_0_0_6.268_0_14s6.268_14_14_14_14-6.268_14-14S21.732_0_14_0zM7_14c0-3.86_3.14-7_7-7s7_3.14_7_7-3.14_7-7_7-7-3.14-7-7z%22/%3E%3C/svg%3E')]">
              {benefitsGrid}
            </div>
          </DesktopSection>
        </SectionShell>

        <SectionShell extraClass="pt-2">
          <MobileAccordion icon={Network} title="Ecosystem">
            <div className="p-4 rounded-lg bg-brand-primary [background-image:url('data:image/svg+xml,%3Csvg_width%3D%2252%22_height%3D%2226%22_viewBox%3D%220_0_52_26%22_xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg_fill%3D%22none%22_fill-rule%3D%22evenodd%22%3E%3Cg_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22%3E%3Cpath_d%3D%22M10_0_h1v26H0V0h10zm28_13h1v26H28V13h10zm28_0_h1v26H56V13h10z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]">
              {ecosystemGrid}
            </div>
          </MobileAccordion>
          <DesktopSection icon={Network} title="Ecosystem">
            <div className="p-4 rounded-lg bg-brand-primary [background-image:url('data:image/svg+xml,%3Csvg_width%3D%2252%22_height%3D%2226%22_viewBox%3D%220_0_52_26%22_xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg_fill%3D%22none%22_fill-rule%3D%22evenodd%22%3E%3Cg_fill%3D%22%23ffffff%22_fill-opacity%3D%220.05%22%3E%3Cpath_d%3D%22M10_0_h1v26H0V0h10zm28_13h1v26H28V13h10zm28_0_h1v26H56V13h10z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]">
              {ecosystemGrid}
            </div>
          </DesktopSection>
        </SectionShell>
      </div>
    </div>
  );
}

export default TSHOTInfo;
