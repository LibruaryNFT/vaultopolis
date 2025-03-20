// src/components/TermsAndPrivacy.jsx

import React from "react";

const TermsAndPrivacy = () => {
  return (
    <div
      className="
        max-w-4xl
        mx-auto
        m-4
        p-8
        bg-brand-secondary
        text-brand-text
        rounded-lg
        shadow-xl
      "
    >
      <h1 className="text-3xl font-bold mb-8">
        Vaultopolis Terms of Service and Privacy Policy
      </h1>

      <div className="space-y-8 text-brand-text/80">
        {/* =============== Introduction =============== */}
        <section className="mb-12">
          <p
            className="
              mb-6
              text-lg
              font-semibold
              bg-brand-primary
              text-brand-text
              p-4
              rounded
            "
          >
            PLEASE READ THESE TERMS CAREFULLY. BY USING VAULTOPOLIS OR ANY OF
            OUR SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
          </p>
          <p className="mb-4">
            Vaultopolis ("we," "us," or "our") is a decentralized application
            that enables users to swap NBA Top Shot NFTs for TSHOT tokens and
            back again through smart contracts on the blockchain (collectively,
            the "App"). The App is currently in a beta/experimental phase and is
            subject to change without notice.
          </p>
          <p className="mb-4">
            All transactions on Vaultopolis are final. We do not offer refunds
            or returns for any digital assets or tokens once a transaction has
            been executed on-chain.
          </p>
        </section>

        {/* =============== 1. Platform Status =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            1. Platform Status
          </h2>
          <div className="space-y-4">
            <p>
              Vaultopolis operates as an independent, decentralized platform. We
              are not affiliated with, endorsed by, or connected to Dapper Labs,
              NBA Top Shot, the National Basketball Association, or any of their
              affiliates or subsidiaries.
            </p>
            <p>
              YOU ACKNOWLEDGE AND AGREE THAT WE ARE A DECENTRALIZED PLATFORM AND
              NOT A BROKER, FINANCIAL INSTITUTION, OR CREDITOR. WE DO NOT TAKE
              CUSTODY OF YOUR ASSETS OR PROVIDE ANY FINANCIAL ADVICE.
            </p>
          </div>
        </section>

        {/* =============== 2. Services =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            2. Services
          </h2>
          <div className="space-y-4">
            <p>
              The App provides the following services through smart contracts:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Swapping NBA Top Shot NFTs for TSHOT tokens</li>
              <li>Holding and transferring TSHOT tokens</li>
              <li>
                Converting TSHOT tokens back to random NBA Top Shot NFTs from
                the vault
              </li>
              <li>Verification of NFT ownership and transaction history</li>
            </ul>
          </div>
        </section>

        {/* =============== 3. Smart Contract Operations =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            3. Smart Contract Operations
          </h2>
          <div className="space-y-4">
            <p>
              All platform operations are executed through immutable smart
              contracts on the blockchain. Users acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Smart contracts operate autonomously and cannot be modified once
                deployed
              </li>
              <li>
                Transactions cannot be reversed or modified once confirmed
              </li>
              <li>
                Random NFT distribution uses verifiable on-chain randomization
              </li>
              <li>Smart contract code is public and verifiable</li>
            </ul>
          </div>
        </section>

        {/* =============== 4. User Responsibilities =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            4. User Responsibilities
          </h2>
          <div className="space-y-4">
            <p>By using Vaultopolis, you represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are the rightful owner of any NFTs you swap</li>
              <li>
                You understand blockchain technology and smart contract risks
              </li>
              <li>You are not located in a prohibited jurisdiction</li>
              <li>You are of legal age in your jurisdiction</li>
              <li>
                You will not attempt to manipulate or exploit the platform
              </li>
            </ul>
          </div>
        </section>

        {/* =============== 5. Risks =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            5. Risks
          </h2>
          <div className="space-y-4">
            <p className="font-semibold">
              YOU EXPRESSLY UNDERSTAND AND AGREE THAT:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The value of NFTs and TSHOT tokens is highly volatile</li>
              <li>Smart contracts may contain unknown vulnerabilities</li>
              <li>Blockchain transactions are irreversible</li>
              <li>
                Random NFT distribution may result in receiving NFTs of
                different perceived value
              </li>
              <li>Regulatory changes may impact platform operations</li>
              <li>We cannot guarantee continuous platform availability</li>
            </ul>
          </div>
        </section>

        {/* =============== 6. Prohibited Activities =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            6. Prohibited Activities
          </h2>
          <div className="space-y-4">
            <p>Users are prohibited from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Using automated systems to interact with the platform</li>
              <li>Attempting to exploit smart contract vulnerabilities</li>
              <li>Engaging in market manipulation</li>
              <li>Using the platform for illegal activities</li>
              <li>Circumventing platform restrictions</li>
            </ul>
          </div>
        </section>

        {/* =============== 7. Privacy Policy =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            7. Privacy Policy
          </h2>
          <div className="space-y-4">
            <p>As a decentralized platform, our data collection is minimal:</p>

            <h3 className="text-xl font-semibold text-brand-text mb-2">
              Information We Collect:
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Public blockchain addresses</li>
              <li>Transaction data on the blockchain</li>
              <li>Smart contract interactions</li>
              <li>Basic website analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-brand-text mb-2">
              We Do Not Collect:
            </h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Personal identification information</li>
              <li>KYC/AML information</li>
              <li>Financial information</li>
              <li>User accounts or profiles</li>
            </ul>

            <h3 className="text-xl font-semibold text-brand-text mb-2">
              Data Usage:
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>To facilitate smart contract operations</li>
              <li>To improve platform functionality</li>
              <li>To monitor platform security</li>
              <li>To analyze usage patterns</li>
            </ul>
          </div>
        </section>

        {/* =============== 8. Disclaimer of Warranties =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            8. Disclaimer of Warranties
          </h2>
          <div className="space-y-4">
            <p className="font-semibold">
              THE APP AND ALL SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF
              ANY KIND. WE MAKE NO WARRANTIES, EXPRESSED OR IMPLIED, AND HEREBY
              DISCLAIM ALL WARRANTIES, INCLUDING:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform availability or reliability</li>
              <li>Smart contract security</li>
              <li>NFT or token values</li>
              <li>Transaction processing times</li>
              <li>Compatibility with external services</li>
            </ul>
          </div>
        </section>

        {/* =============== 9. Limitation of Liability =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            9. Limitation of Liability
          </h2>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR ANY RELATED
            SERVICES.
          </p>
        </section>

        {/* =============== 10. Changes to Terms =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            10. Changes to Terms
          </h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting to the platform. Your
            continued use of the platform constitutes acceptance of the modified
            terms.
          </p>
        </section>

        {/* =============== 11. Authorized Use of Smart Contracts =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            11. Authorized Use of Smart Contracts
          </h2>
          <div className="space-y-4">
            <p>
              Vaultopolis’s smart contracts and related functionalities (“Smart
              Contracts”) are intended to be accessed solely through the
              official user interface at{" "}
              <a
                href="https://vaultopolis.com"
                className="text-flow-light hover:text-flow-dark"
              >
                https://vaultopolis.com
              </a>{" "}
              (the “Official Interface”). By using the App, you agree not to
              interact with or invoke the Smart Contracts via any other means,
              including direct contract calls, unofficial tools, or third-party
              interfaces, without explicit authorization from Vaultopolis.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Bypassing Controls:</strong> Any attempt to call or
                execute the Smart Contracts outside the Official Interface may
                bypass certain controls, checks, or user protections. You
                acknowledge that you do so at your own risk and assume full
                responsibility for any resulting loss, error, or damage.
              </li>
              <li>
                <strong>Disclaimer of Liability:</strong> Vaultopolis disclaims
                all liability for any losses arising out of or related to Smart
                Contract interactions performed outside the Official Interface.
                Unauthorized or unsupported integrations may produce unexpected
                results and are not covered by Vaultopolis’s warranties or
                protections.
              </li>
              <li>
                <strong>No Support:</strong> Vaultopolis does not provide
                support for transactions, swaps, or other interactions executed
                without using the Official Interface. If you or any third party
                uses alternate interfaces or direct calls, you do so entirely at
                your own risk and responsibility.
              </li>
            </ul>
          </div>
        </section>

        {/* =============== 12. Indemnification =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            12. Indemnification
          </h2>
          <p className="mb-4">
            You agree to indemnify and hold harmless Vaultopolis, its affiliates
            and their respective officers, employees, contractors, agents, and
            licensors from and against any and all claims, damages, liabilities,
            costs, or expenses (including reasonable attorneys’ fees) arising
            out of or related to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use or misuse of the Platform</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any law or regulation</li>
            <li>Any infringement by you of any intellectual property rights</li>
          </ul>
        </section>

        {/* =============== 13. Beta/Experimental Notice =============== */}
        <section>
          <h2 className="text-2xl font-semibold text-brand-text mb-4">
            13. Beta/Experimental Status
          </h2>
          <p className="mb-4">
            Vaultopolis is currently offered in a beta/experimental capacity.
            Features, functionality, and user experience are subject to change
            without notice. By participating in the beta, you acknowledge the
            possibility of encountering bugs, errors, or other unforeseen
            issues.
          </p>
          <p className="mb-4">
            While we strive to maintain platform stability, we make no
            guarantees about the reliability, security, or performance of
            Vaultopolis during the beta phase. You agree to use Vaultopolis at
            your own risk.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndPrivacy;
