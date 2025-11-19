import React from "react";
import { Helmet } from "react-helmet-async";

const TermsOfUse = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Use | Vaultopolis</title>
        <meta name="description" content="Vaultopolis Terms of Use. Learn about the terms governing your use of the Vaultopolis website and user interface." />
        <meta name="keywords" content="vaultopolis terms of use, website terms, user interface terms" />
        <link rel="canonical" href="https://vaultopolis.com/terms-of-use" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Terms of Use | Vaultopolis" />
        <meta property="og:description" content="Vaultopolis Terms of Use for our website and user interface." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/terms-of-use" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Use | Vaultopolis" />
        <meta name="twitter:description" content="Vaultopolis Terms of Use." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Use",
            "description": "Vaultopolis Terms of Use",
            "url": "https://vaultopolis.com/terms-of-use"
          })}
        </script>
      </Helmet>
      
      <div className="w-full max-w-4xl mx-auto m-4 p-8 bg-brand-secondary text-brand-text rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-8">
          Vaultopolis Terms of Use
        </h1>

        <div className="space-y-8 text-brand-text/80">
          {/* =============== Introduction =============== */}
          <section className="mb-12">
            <p className="mb-4 text-sm text-brand-text/60">
              Last Updated: November 2025
            </p>
            <p className="mb-4">
              These Terms of Use ("Terms") govern your access to and use of the Vaultopolis website, user interface, and related materials (collectively, the "Site"). By accessing or using the Site, you agree to these Terms.
            </p>
            <p className="mb-4">
              These Terms govern use of the website and content, not the smart-contract interactions themselves.
            </p>
            <p className="mb-4">
              Smart contract interactions are governed by our <a href="/terms" className="text-brand-accent hover:text-brand-accent/80 underline">Terms of Service</a>.
            </p>
          </section>

          {/* =============== 1. Access to the Site =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              1. Access to the Site
            </h2>
            <div className="space-y-4">
              <p>
                The Site is provided for informational and user-interface purposes only.
              </p>
              <p>
                Vaultopolis does not guarantee:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Continuous access to the Site</li>
                <li>Accuracy or completeness of displayed data</li>
                <li>Compatibility with your device or browser</li>
              </ul>
              <p>
                You are responsible for maintaining your own hardware, software, wallet, and security.
              </p>
            </div>
          </section>

          {/* =============== 2. No Financial, Legal, or Investment Advice =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              2. No Financial, Legal, or Investment Advice
            </h2>
            <div className="space-y-4">
              <p>
                Information on the Site is provided for general informational purposes only.
              </p>
              <p>
                Vaultopolis does not provide:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Investment advice</li>
                <li>Legal or tax advice</li>
                <li>Financial recommendations</li>
                <li>Trading guidance</li>
                <li>Valuation guarantees related to digital collectibles or tokens</li>
              </ul>
              <p>
                You acknowledge that all decisions you make are your own.
              </p>
            </div>
          </section>

          {/* =============== 3. Links to Third-Party Services =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              3. Links to Third-Party Services
            </h2>
            <div className="space-y-4">
              <p>
                The Site may contain links to third-party services (e.g., marketplaces, DEXs, analytics tools).
              </p>
              <p>
                Vaultopolis does not control, endorse, or guarantee these services.
              </p>
              <p>
                You use external links entirely at your own risk.
              </p>
            </div>
          </section>

          {/* =============== 4. Intellectual Property =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              4. Intellectual Property
            </h2>
            <div className="space-y-4">
              <p>
                All content provided through the Site—including branding, UI elements, text, graphics, code, and design—is owned by Vaultopolis or its licensors and protected by applicable laws.
              </p>
              <p>
                You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Copy, resell, distribute, or modify Site content</li>
                <li>Reverse-engineer or attempt to extract source code</li>
                <li>Use Vaultopolis branding without written permission</li>
              </ul>
              <p>
                NBA Top Shot and associated trademarks are owned by Dapper Labs and/or the NBA. Vaultopolis is not affiliated with these entities.
              </p>
            </div>
          </section>

          {/* =============== 5. Acceptable Use =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              5. Acceptable Use
            </h2>
            <div className="space-y-4">
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Site for illegal activity</li>
                <li>Attempt to breach or bypass security controls</li>
                <li>Scrape, crawl, or harvest data without permission</li>
                <li>Upload malicious code or interfere with Site operation</li>
                <li>Misrepresent your identity</li>
              </ul>
              <p>
                Vaultopolis may restrict or block your access if misuse is detected.
              </p>
            </div>
          </section>

          {/* =============== 6. Accuracy of Information =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              6. Accuracy of Information
            </h2>
            <div className="space-y-4">
              <p>
                Data displayed on the Site may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cached or delayed blockchain information</li>
                <li>Third-party API feeds</li>
                <li>User-submitted data</li>
              </ul>
              <p>
                Vaultopolis does not warrant the accuracy, completeness, or timeliness of displayed information.
              </p>
            </div>
          </section>

          {/* =============== 7. No Guarantees of Availability =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              7. No Guarantees of Availability
            </h2>
            <div className="space-y-4">
              <p>
                The Site may be unavailable due to maintenance, outages, upgrades, or failures.
              </p>
              <p>
                Vaultopolis is not liable for downtime, errors, or interruptions.
              </p>
              <p>
                Smart contract functionality may remain available even if the Site is offline.
              </p>
            </div>
          </section>

          {/* =============== 8. Disclaimer of Warranties =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              8. Disclaimer of Warranties
            </h2>
            <div className="space-y-4">
              <p className="font-semibold">
                THE SITE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
              </p>
              <p>
                VAULTOPOLIS DISCLAIMS ALL WARRANTIES RELATING TO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SITE ACCURACY</li>
                <li>AVAILABILITY</li>
                <li>PERFORMANCE</li>
                <li>SECURITY</li>
                <li>MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE</li>
              </ul>
              <p>
                You use the Site at your own risk.
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
                To the fullest extent permitted by law, Vaultopolis is not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Loss of digital assets</li>
                <li>Losses arising from reliance on Site information</li>
                <li>Damage to your device or software</li>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Errors or omissions in displayed data</li>
              </ul>
              <p>
                Your sole remedy is to discontinue use of the Site.
              </p>
            </div>
          </section>

          {/* =============== 10. Changes to the Site =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              10. Changes to the Site
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis may modify, update, or remove portions of the Site at any time without notice.
              </p>
              <p>
                This includes interface changes, features, layouts, or available information.
              </p>
            </div>
          </section>

          {/* =============== 11. Changes to These Terms =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              11. Changes to These Terms
            </h2>
            <div className="space-y-4">
              <p>
                Vaultopolis may revise these Terms periodically.
              </p>
              <p>
                Your continued use of the Site constitutes acceptance of updated Terms.
              </p>
            </div>
          </section>

          {/* =============== 12. Contact =============== */}
          <section>
            <h2 className="text-2xl font-semibold text-brand-text mb-4">
              12. Contact
            </h2>
            <p className="mb-4">
              If you have questions about these Terms of Use, you may contact Vaultopolis through the communication channels listed on the official website.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default TermsOfUse;

