import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import AllDayGrailsVault from "../../components/AllDayGrailsVault";

function AllDayGrailsVaultPage() {
  return (
    <>
      <Helmet>
        <title>AllDay Grail Bounties Vault | Treasury-Held NFL AllDay Moments | Vaultopolis</title>
        <meta
          name="description"
          content="Browse the NFL AllDay Moments held by the Grail Bounties Vault. Explore the collection available for trading and offers."
        />
        <meta name="keywords" content="grail bounties vault, treasury moments, nfl allday treasury, vaultopolis treasury, allday grails" />
        <link rel="canonical" href="https://vaultopolis.com/vaults/alldaygrails" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="AllDay Grail Bounties Vault | Treasury-Held NFL AllDay Moments" />
        <meta property="og:description" content="Browse the NFL AllDay Moments held by the Grail Bounties Vault." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/vaults/alldaygrails" />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AllDay Grail Bounties Vault | Treasury-Held NFL AllDay Moments" />
        <meta name="twitter:description" content="Browse the NFL AllDay Moments held by the Vaultopolis Treasury." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for Grail Bounties Vault */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "AllDay Grail Bounties Vault Contents",
            "description": "Browse the NFL AllDay Moments held by the Vaultopolis Treasury",
            "url": "https://vaultopolis.com/vaults/alldaygrails"
          })}
        </script>
      </Helmet>

      {/* Vault Navigation */}
      <div className="w-full mt-4 mb-4">
        <div className="max-w-6xl mx-auto mx-2 sm:mx-4">
          <div className="flex items-center gap-2 bg-brand-primary rounded-lg p-2" role="tablist" aria-label="Vault sections">
            <Link
              to="/vaults/tshot"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-blue"
            >
              <img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="hidden sm:inline text-sm sm:text-base">TSHOT</span>
              <span className="sm:hidden text-sm">TSHOT</span>
            </Link>
            <Link
              to="/vaults/topshotgrails"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-blue"
            >
              <span aria-hidden="true" className="text-3xl sm:text-4xl">🏛️</span>
              <span className="hidden sm:inline text-sm sm:text-base">TopShot Grails</span>
              <span className="sm:hidden text-sm">TS Grails</span>
            </Link>
            <Link
              to="/vaults/alldaygrails"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-opolis text-opolis bg-brand-secondary"
            >
              <span aria-hidden="true" className="text-3xl sm:text-4xl">🏈</span>
              <span className="hidden sm:inline text-sm sm:text-base">AllDay Grails</span>
              <span className="sm:hidden text-sm">AD Grails</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden mb-4">
          <div className="p-4 sm:p-6 border-b border-brand-border">
            <div className="max-w-4xl">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-text mb-3">
                AllDay Grail Bounties Vault Contents
              </h2>
              <p className="text-sm sm:text-base text-brand-text/80 leading-relaxed mb-3">
                This vault contains the NFL AllDay Moments acquired through our Grail Bounties program. 
                These are higher-end grails and culturally significant moments that we actively acquire for future 
                innovative products and community initiatives. You can browse the collection and view details of 
                each moment held in the treasury.
              </p>
              <p className="text-sm text-brand-text/70">
                <a 
                  href="/bounties/allday" 
                  className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-accent/80 underline font-medium transition-colors"
                >
                  Learn more about Grail Bounties →
                </a>
              </p>
            </div>
          </div>
        </div>
        <AllDayGrailsVault />
      </div>
    </>
  );
}

export default AllDayGrailsVaultPage;

