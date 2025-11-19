// src/components/TermsAndPrivacy.jsx

import React from "react";
import { Helmet } from "react-helmet-async";

const TermsAndPrivacy = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Vaultopolis</title>
        <meta name="description" content="Vaultopolis Terms of Service. Learn about our smart-contract platform for exchanging digital collectibles and TSHOT tokens on Flow blockchain." />
        <meta name="keywords" content="vaultopolis terms, terms of service, flow blockchain terms, nft terms, digital collectibles terms" />
        <link rel="canonical" href="https://vaultopolis.com/terms" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Terms of Service | Vaultopolis" />
        <meta property="og:description" content="Vaultopolis Terms of Service for our smart-contract platform." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/terms" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service | Vaultopolis" />
        <meta name="twitter:description" content="Vaultopolis Terms of Service." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Vaultopolis Terms of Service",
            "url": "https://vaultopolis.com/terms"
          })}
        </script>
      </Helmet>
      
      <div className="w-full max-w-4xl mx-auto m-4 p-8 bg-brand-secondary text-brand-text rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-8">
          Vaultopolis Terms of Service
        </h1>

        <div className="space-y-8 text-brand-text/80">
          {/* =============== Introduction =============== */}
          <section className="mb-12">
            <p className="mb-4 text-sm text-brand-text/60">
              Last Updated: November 2025
            </p>
            <p className="mb-6 text-lg font-semibold bg-brand-primary text-brand-text p-4 rounded">
              Please read these Terms carefully. By accessing or using Vaultopolis (the "Platform"), you agree to be bound by these Terms.
            </p>
            <p className="mb-4">
              Vaultopolis ("we," "us," or "our") provides smart-contract tools that allow users to exchange eligible digital collectibles for TSHOT tokens and redeem TSHOT through automated on-chain mechanisms. The Platform is experimental, may change without notice, and is used at your own risk.
            </p>
          </section>

          {/* =============== 1. Independent Platform =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              1. Independent Platform
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis is an independent project and is not affiliated with, endorsed by, or connected to Dapper Labs, NBA Top Shot, the NBA, or any related entities.
              </p>
              <p>
                We do not act as a broker, exchange, custodian, dealer, advisor, or financial institution. We do not hold user assets; interactions occur directly between users and on-chain smart contracts.
              </p>
            </div>
          </section>

          {/* =============== 2. Smart Contract-Based Services =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              2. Smart Contract-Based Services
            </h2>
            <div className="space-y-4">
              <p>
                Through the Platform, users may:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Deposit eligible digital collectibles into a smart-contract vault</li>
                <li>Mint TSHOT tokens corresponding to those deposits</li>
                <li>Redeem TSHOT through automated vault logic that selects an eligible digital collectible</li>
                <li>View relevant on-chain data associated with digital collectible deposits, withdrawals, and balances</li>
              </ul>
              <p>
                All transactions occur exclusively on-chain, and cannot be reversed once executed.
              </p>
            </div>
          </section>

          {/* =============== 3. No Custody or Control =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              3. No Custody or Control
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis does not custody or manage user assets off-chain. Smart contracts are autonomous and users interact with them directly.
              </p>
              <p>
                You are responsible for the security of your wallet, keys, and devices.
              </p>
            </div>
          </section>

          {/* =============== 4. User Responsibilities =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              4. User Responsibilities
            </h2>
            <div className="space-y-4">
              <p>By using the Platform, you represent that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are the lawful owner of the digital collectibles you interact with</li>
                <li>You understand blockchain risks, including loss of assets</li>
                <li>You are not in a prohibited jurisdiction</li>
                <li>You will not attempt to exploit, attack, or misuse the Platform or smart contracts</li>
              </ul>
            </div>
          </section>

          {/* =============== 5. Risks =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              5. Risks
            </h2>
            <div className="space-y-4">
              <p>
                Digital collectibles and tokens are volatile and may lose value. You acknowledge:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Smart contracts may contain bugs or behave unexpectedly</li>
                <li>Blockchain transactions are irreversible</li>
                <li>Redemption results may differ in perceived value</li>
                <li>The Platform may change, fail, or be discontinued</li>
                <li>Regulatory changes may affect functionality or availability</li>
              </ul>
              <p className="font-semibold">
                You use the Platform entirely at your own risk.
              </p>
            </div>
          </section>

          {/* =============== 6. Prohibited Actions =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              6. Prohibited Actions
            </h2>
            <div className="space-y-4">
              <p>You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Exploit smart contracts</li>
                <li>Use bots or automation to manipulate activity</li>
                <li>Engage in illegal, fraudulent, or abusive behavior</li>
                <li>Circumvent rate limits, safeguards, or restrictions</li>
                <li>Use the Platform for financial crime, sanctions evasion, or other prohibited uses</li>
              </ul>
            </div>
          </section>

          {/* =============== 7. Data & Privacy =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              7. Data & Privacy
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis collects minimal information, primarily:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Public blockchain addresses</li>
                <li>On-chain transaction data</li>
                <li>Basic website analytics</li>
              </ul>
              <p>
                We do not collect personal identification or financial account information.
              </p>
            </div>
          </section>

          {/* =============== 8. No Warranties =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              8. No Warranties
            </h2>
            <div className="space-y-4">
              <p>
                The Platform is provided "as is" without warranties of any kind, express or implied, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Availability</li>
                <li>Security</li>
                <li>Smart contract accuracy</li>
                <li>Market value of digital assets</li>
                <li>Error-free or uninterrupted access</li>
              </ul>
              <p>
                You assume all risks related to your use of the Platform.
              </p>
            </div>
          </section>

          {/* =============== 9. Limitation of Liability =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              9. Limitation of Liability
            </h2>
            <div className="space-y-4">
              <p>
                To the maximum extent permitted by law, Vaultopolis is not liable for any:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of digital assets</li>
                <li>Indirect, punitive, or consequential damages</li>
                <li>Smart contract bugs or failures</li>
                <li>Wallet breaches or user mistakes</li>
                <li>Market losses or volatility</li>
              </ul>
              <p>
                Your sole remedy is to stop using the Platform.
              </p>
            </div>
          </section>

          {/* =============== 10. Smart Contract Access =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              10. Smart Contract Access
            </h2>
            <div className="space-y-4">
              <p>
                The Platform's smart contracts are intended to be used via the official Vaultopolis interface.
              </p>
              <p>
                Using them through alternate interfaces, direct calls, scripts, or third-party tools:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>May bypass safeguards</li>
                <li>Is at your own risk</li>
                <li>Is not supported, and</li>
                <li>Releases Vaultopolis from any liability for resulting loss or malfunction</li>
              </ul>
            </div>
          </section>

          {/* =============== 11. Indemnification =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              11. Indemnification
            </h2>
            <div className="space-y-4">
              <p>
                You agree to indemnify Vaultopolis from any claims arising from:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your use or misuse of the Platform</li>
                <li>Your breach of these Terms</li>
                <li>Violations of law or third-party rights</li>
              </ul>
            </div>
          </section>

          {/* =============== 12. Beta Status =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              12. Beta Status
            </h2>
            <p className="mb-4">
              Vaultopolis is currently in an experimental/beta phase.
            </p>
            <p className="mb-4">
              Features may change, fail, or be removed without notice.
            </p>
          </section>

          {/* =============== 13. Changes to Terms =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              13. Changes to Terms
            </h2>
            <p className="mb-4">
              We may modify these Terms at any time. Continued use constitutes acceptance of updated Terms.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default TermsAndPrivacy;
