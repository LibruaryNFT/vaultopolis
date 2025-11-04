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
      </Helmet>

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
        <AllDayGrailsVault />
      </div>
    </>
  );
}

export default AllDayGrailsVaultPage;

