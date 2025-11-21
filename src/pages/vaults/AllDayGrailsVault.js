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
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="bg-brand-primary rounded-lg p-4 border border-brand-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm font-medium text-brand-text/70 whitespace-nowrap">View Vault:</span>
              <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Vault sections">
                <Link
                  to="/vaults/tshot"
                  className="inline-flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-2 border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-secondary/80 hover:border-brand-accent/50 transition-all duration-200"
                >
                  <img src="https://storage.googleapis.com/vaultopolis/TSHOT.png" alt="TSHOT" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">TSHOT</span>
                </Link>
                <Link
                  to="/vaults/topshotgrails"
                  className="inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-2 border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-secondary/80 hover:border-brand-accent/50 transition-all duration-200"
                >
                  <span className="text-xs sm:text-sm">TopShot Grails</span>
                </Link>
                <Link
                  to="/vaults/alldaygrails"
                  className="inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-2 border-brand-accent text-brand-accent bg-brand-secondary hover:bg-brand-secondary/80 transition-all duration-200 shadow-sm"
                >
                  <span className="text-xs sm:text-sm">AllDay Grails</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden mb-4">
          <div className="p-4 sm:p-6 border-b border-brand-border">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl sm:text-5xl" aria-hidden="true">🏈</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
                    AllDay Grail Bounties Vault Contents
                  </h2>
                  <p className="text-sm text-brand-text/70 mt-1">
                    Treasury • High-End Grails • Community Initiatives
                  </p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-brand-text/80 leading-relaxed mb-3">
                This vault contains NFL AllDay Moments acquired through our Grail Bounties program. 
                These are higher-end grails and culturally significant moments held for future innovative products and community initiatives.
              </p>
              <p className="text-sm text-brand-text/70">
                <Link 
                  to="/bounties/allday" 
                  className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-accent/80 underline font-medium transition-colors"
                >
                  Learn more about Grail Bounties →
                </Link>
              </p>
            </div>
          </div>
          
          <div className="p-3 sm:p-4">
            <AllDayGrailsVault />
          </div>
        </div>
      </div>
    </>
  );
}

export default AllDayGrailsVaultPage;

