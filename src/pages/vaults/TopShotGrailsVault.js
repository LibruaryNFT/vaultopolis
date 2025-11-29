import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { Trophy } from "lucide-react";
import GrailBountiesVault from "../../components/GrailBountiesVault";

function TopShotGrailsVaultPage() {
  const location = useLocation();
  const baseUrl = "https://vaultopolis.com";
  const canonicalUrl = `${baseUrl}${location.pathname}`;
  const pageTitle = "Vaultopolis - TopShot Grail Bounties Vault";
  
  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Browse the NBA Top Shot Moments held by the Grail Bounties Vault. Explore the collection available for trading and offers."
        />
        <meta name="keywords" content="grail bounties vault, treasury moments, nba top shot treasury, vaultopolis treasury, topshot grails" />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="TopShot Grail Bounties Vault | Treasury-Held NBA Top Shot Moments" />
        <meta property="og:description" content="Browse the NBA Top Shot Moments held by the Grail Bounties Vault." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TopShot Grail Bounties Vault | Treasury-Held NBA Top Shot Moments" />
        <meta name="twitter:description" content="Browse the NBA Top Shot Moments held by the Vaultopolis Treasury." />
        <meta name="twitter:image" content="https://storage.googleapis.com/vaultopolis/TSHOT.png" />
        
        {/* Structured Data for Grail Bounties Vault */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "TopShot Grail Bounties Vault Contents",
            "description": "Browse the NBA Top Shot Moments held by the Vaultopolis Treasury",
            "url": "https://vaultopolis.com/vaults/topshotgrails"
          })}
        </script>
      </Helmet>

      {/* TopShot Grail Bounties Vault Contents */}
      <div className="w-full pt-4">
        <div className="px-3 sm:px-4">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 pb-4 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-opolis" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
                  TopShot Grail Bounties Vault Contents
                </h2>
                <p className="text-sm text-brand-text/70 mt-1">
                  Treasury • High-End Grails • Community Initiatives
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-brand-text/80 leading-relaxed mb-3">
              This vault contains NBA Top Shot Moments acquired through our Grail Bounties program. 
              These are higher-end grails and culturally significant moments held for future innovative products and community initiatives.
            </p>
            <p className="text-sm text-brand-text/70">
              <Link 
                to="/bounties/topshot" 
                className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-accent/80 underline font-medium transition-colors"
              >
                Learn more about Grail Bounties →
              </Link>
            </p>
          </div>
        </div>
        
        <div className="w-full">
          <GrailBountiesVault />
        </div>
      </div>
    </>
  );
}

export default TopShotGrailsVaultPage;

