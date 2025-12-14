import React from "react";
import { Helmet } from "react-helmet-async";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Vaultopolis - Privacy Policy</title>
        <meta name="description" content="Vaultopolis Privacy Policy. Learn about what information we collect and how we protect your privacy." />
        <meta name="keywords" content="vaultopolis privacy policy, data protection, privacy" />
        <link rel="canonical" href="https://vaultopolis.com/privacy-policy" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Vaultopolis - Privacy Policy" />
        <meta property="og:description" content="Vaultopolis Privacy Policy for our website and services." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/privacy-policy" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Vaultopolis - Privacy Policy" />
        <meta name="twitter:description" content="Vaultopolis Privacy Policy." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "Vaultopolis Privacy Policy",
            "url": "https://vaultopolis.com/privacy-policy"
          })}
        </script>
      </Helmet>
      
      <div className="w-full max-w-4xl mx-auto m-4 p-8 bg-brand-secondary text-brand-text rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-8">
          Vaultopolis Privacy Policy
        </h1>

        <div className="space-y-8 text-brand-text/80">
          {/* =============== Introduction =============== */}
          <section className="mb-12">
            <p className="mb-4 text-sm text-brand-text/60">
              Last Updated: November 2025
            </p>
            <p className="mb-4">
              Vaultopolis ("we," "us," or "our") provides a user interface and smart-contract tooling for interacting with digital collectibles and the TSHOT token. This Privacy Policy explains what information we collect, how we use it, and your choices.
            </p>
            <p className="mb-4">
              Vaultopolis is a non-custodial platform. We do not collect personal identification information and do not run user accounts.
            </p>
            <p className="mb-4">
              By accessing or using the Vaultopolis website or related services ("Site"), you consent to this Privacy Policy.
            </p>
          </section>

          {/* =============== 1. Information We Collect =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <p>
                We collect only the minimum information required for the operation and security of the Site.
              </p>

              <h3 className="text-xl font-semibold text-brand-text mb-2">
                A. Public Blockchain Data (Automatically Collected)
              </h3>
              <p>
                We may display or process publicly available on-chain information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Wallet addresses</li>
                <li>On-chain transaction history</li>
                <li>Smart-contract calls</li>
                <li>Digital collectible metadata</li>
                <li>Token balances related to TSHOT interactions</li>
                <li>Vault activity (deposits, mints, burns, redemptions)</li>
              </ul>
              <p>
                This information is inherently public on the Flow blockchain.
              </p>

              <h3 className="text-xl font-semibold text-brand-text mb-2">
                B. Technical & Analytics Data
              </h3>
              <p>
                We may collect limited technical information, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>IP address (via server logs or Cloudflare)</li>
                <li>Browser type & version</li>
                <li>Device information</li>
                <li>Operating system</li>
                <li>Referral URLs</li>
                <li>Page interactions</li>
                <li>Basic usage statistics</li>
              </ul>
              <p>
                Tools that may be used:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloudflare analytics</li>
                <li>Minimal privacy-focused web analytics (if enabled)</li>
              </ul>
              <p>
                We do not use invasive tracking or behavioral profiling.
              </p>

              <h3 className="text-xl font-semibold text-brand-text mb-2">
                C. Information You Voluntarily Provide
              </h3>
              <p>
                If you contact us (e.g., email, X/Twitter messages), we may receive:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email address</li>
                <li>Written communications</li>
                <li>Support-related information</li>
              </ul>
              <p>
                We use this only to respond to you.
              </p>
            </div>
          </section>

          {/* =============== 2. Information We Do NOT Collect =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              2. Information We Do NOT Collect
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis does not collect, store, or request:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Names</li>
                <li>Phone numbers</li>
                <li>Home addresses</li>
                <li>Government IDs</li>
                <li>KYC/AML documents</li>
                <li>Bank information</li>
                <li>Payment card information</li>
                <li>Social security numbers</li>
                <li>Biometrics</li>
                <li>Personal profiles</li>
                <li>Off-chain digital identities</li>
              </ul>
              <p>
                We also do not track users across websites or build behavioral profiles.
              </p>
            </div>
          </section>

          {/* =============== 3. How We Use Information =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              3. How We Use Information
            </h2>
            <div className="space-y-4">
              <p>
                We use collected data solely for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Operating the Site</li>
                <li>Security, fraud prevention, and abuse detection</li>
                <li>Displaying on-chain activity related to TSHOT</li>
                <li>Improving platform performance</li>
                <li>Debugging service issues</li>
                <li>Monitoring system health</li>
                <li>Supporting user inquiries</li>
              </ul>
              <p>
                We do not sell data, monetize data, run ads, or share personal information with advertisers.
              </p>
            </div>
          </section>

          {/* =============== 4. Sharing of Information =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              4. Sharing of Information
            </h2>
            <div className="space-y-4">
              <p>
                We do not sell or rent user data. We may share information only with:
              </p>

              <h3 className="text-xl font-semibold text-brand-text mb-2">
                A. Service Providers
              </h3>
              <p>
                Strictly to run the Site:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloudflare (security, DDoS protection)</li>
                <li>Analytics providers (if used)</li>
                <li>Hosting providers</li>
              </ul>
              <p>
                These providers have access only to technical metadata necessary for operation.
              </p>

              <h3 className="text-xl font-semibold text-brand-text mb-2">
                B. Law Enforcement
              </h3>
              <p>
                Only if required by valid legal process.
              </p>
            </div>
          </section>

          {/* =============== 5. Cookies & Tracking Technologies =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              5. Cookies & Tracking Technologies
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis uses minimal cookies necessary for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Basic website operations</li>
                <li>Security and anti-abuse</li>
                <li>Session settings</li>
                <li>Analytics (if enabled)</li>
              </ul>
              <p>
                We do not use:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Advertising cookies</li>
                <li>Third-party tracking networks</li>
                <li>Behavioral profiling</li>
              </ul>
              <p>
                If we ever add additional cookies, this policy will be updated.
              </p>
            </div>
          </section>

          {/* =============== 6. Third-Party Links =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              6. Third-Party Links
            </h2>
            <div className="space-y-4">
              <p>
                The Site may link to external services such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Marketplaces (e.g., Top Shot)</li>
                <li>DEXs</li>
                <li>Documentation pages</li>
                <li>Social media accounts</li>
              </ul>
              <p>
                We do not control external websites. Their privacy practices are governed by their own policies.
              </p>
              <p>
                You use external links at your own risk.
              </p>
            </div>
          </section>

          {/* =============== 7. Data Security =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              7. Data Security
            </h2>
            <div className="space-y-4">
              <p>
                We implement reasonable administrative and technical safeguards to protect data, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cloudflare DDoS protection</li>
                <li>HTTPS encryption</li>
                <li>Restricted access to backend services</li>
                <li>No personal data stored on servers</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure.
              </p>
            </div>
          </section>

          {/* =============== 8. Children's Privacy =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              8. Children's Privacy
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis is not intended for children under 18.
              </p>
              <p>
                We do not knowingly collect data from children.
              </p>
            </div>
          </section>

          {/* =============== 9. International Use =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              9. International Use
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis is accessible globally.
              </p>
              <p>
                By using the Site, you acknowledge:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Data may be processed outside your home country</li>
                <li>Data laws may differ from your jurisdiction</li>
              </ul>
              <p>
                Vaultopolis complies with applicable data protection obligations for minimal-data services.
              </p>
            </div>
          </section>

          {/* =============== 10. Your Choices =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              10. Your Choices
            </h2>
            <div className="space-y-4">
              <p>
                Since we do not maintain accounts or store personal data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You cannot request deletion of on-chain data (public and immutable)</li>
                <li>You may disable cookies in your browser</li>
                <li>You may stop using the Site at any time</li>
              </ul>
              <p>
                If you contact us directly, you may request deletion of emails or communications.
              </p>
            </div>
          </section>

          {/* =============== 11. Changes to This Privacy Policy =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <div className="space-y-4">
              <p>
                We may update this Privacy Policy from time to time.
              </p>
              <p>
                Revised versions become effective upon posting to the Site.
              </p>
              <p>
                Your continued use of the Site constitutes acceptance of any updated policies.
              </p>
            </div>
          </section>

          {/* =============== 12. Contact =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              12. Contact
            </h2>
            <p className="mb-4">
              If you have questions or requests related to privacy, contact us through:
            </p>
            <p className="mb-4">
              The communication channels listed on <a href="https://vaultopolis.com" className="text-brand-accent hover:text-brand-accent/80 underline">https://vaultopolis.com</a>
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;

