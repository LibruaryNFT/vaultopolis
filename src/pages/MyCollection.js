import React, { useContext, useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { FaSyncAlt } from "react-icons/fa";
import { UserDataContext } from "../context/UserContext";
import { useAllDayContext } from "../context/AllDayContext";
import MomentCard from "../components/MomentCard";
import AllDayMomentCard from "../components/AllDayMomentCard";
import AccountSelection from "../components/AccountSelection";
import { useMomentFilters } from "../hooks/useMomentFilters";
import PageWrapper from "../components/PageWrapper";
import { getSeriesFilterLabel } from "../utils/seriesNames";
import { SUBEDITIONS } from "../utils/subeditions";
import FilterDropdown from "../components/FilterDropdown";
 



export default function MyCollection() {
  const {
    user,
    accountData,
    selectedAccount,
    selectedAccountType,
    dispatch,
    isRefreshing,
    refreshUserData,
  } = useContext(UserDataContext);

  // AllDay context
  const {
    allDayCollectionData,
    allDayMetadataCache,
    isRefreshingAllDay,
    refreshAllDayData,
    fetchAllDayCollection,
    fetchAllDayCollectionDetails,
    setAllDayCollectionData,
  } = useAllDayContext();

  // Collection type state (Top Shot vs All Day)
  const [collectionType, setCollectionType] = useState('topshot');

  // Show metadata toggle state
  const [showMetadata, setShowMetadata] = useState(false);

  // Removed verbose AllDay debug logs to reduce console noise
  
  
  // AllDay filter state - will be initialized with all available options
  const [allDayFilter, setAllDayFilter] = useState({
    selectedTiers: [],
    selectedSeries: [],
    selectedTeam: "All",
    selectedPlayer: "All",
    lockedStatus: "All",
    sortBy: "lowest-serial",
    currentPage: 1,
  });


  // Load AllDay collection when switching to AllDay tab
  useEffect(() => {
    if (collectionType === 'allday') {
      const currentAddress = selectedAccount || accountData?.parentAddress;
      if (currentAddress && !allDayCollectionData[currentAddress]) {
        // Load AllDay collection for the current address
        const loadAllDayCollection = async () => {
          try {
            const ids = await fetchAllDayCollection(currentAddress);
            if (ids.length > 0) {
              const details = await fetchAllDayCollectionDetails(currentAddress, ids);
              setAllDayCollectionData(prev => ({
                ...prev,
                [currentAddress]: { nftDetails: details }
              }));
            }
          } catch (error) {
            console.error('Failed to load AllDay collection:', error);
          }
        };
        loadAllDayCollection();
      }
    }
  }, [collectionType, selectedAccount, accountData?.parentAddress, allDayCollectionData, fetchAllDayCollection, fetchAllDayCollectionDetails, setAllDayCollectionData]);

  // Pinnacle removed

  // Get child account object
  const childObj = selectedAccountType === "child"
    ? accountData?.childrenData?.find(
        (c) => c.addr?.toLowerCase?.() === selectedAccount?.toLowerCase?.()
      )
    : null;

  // Get moments from the selected account, filtered by collection type
  const allMoments = useMemo(() => {
    if (collectionType === 'topshot') {
      // For TopShot, use existing UserContext data
      return childObj?.nftDetails || accountData?.nftDetails || [];
    } else if (collectionType === 'allday') {
      // For AllDay, use AllDay context data
      const currentAddress = selectedAccount || accountData?.parentAddress;
      if (!currentAddress) return [];
      
      // Get AllDay collection data for the current address
      const addressData = allDayCollectionData[currentAddress];
      return addressData?.nftDetails || [];
    }
  }, [childObj?.nftDetails, accountData?.nftDetails, collectionType, selectedAccount, accountData?.parentAddress, allDayCollectionData]);

  // Filter moments based on collection type
  const moments = allMoments;

  // Generate AllDay filter options
  const allDayFilterOptions = useMemo(() => {
    if (collectionType !== 'allday') return {};
    
    const mergedMoments = moments.map(nft => {
      const metadata = allDayMetadataCache[nft.editionID] || {};
      return { ...nft, ...metadata };
    });
    
    // Tier options in correct order
    const tierOrder = ['common', 'uncommon', 'rare', 'legendary', 'ultimate'];
    const tierOptions = tierOrder.filter(tier => 
      mergedMoments.some(nft => nft.tier?.toLowerCase() === tier)
    );
    
    // Series options in numerical order
    const seriesOptions = [...new Set(mergedMoments.map(nft => nft.series).filter(Boolean))]
      .sort((a, b) => Number(a) - Number(b));
    
    // Team and player options in alphabetical order
    const teamOptions = [...new Set(mergedMoments.map(nft => nft.teamName).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    const playerOptions = [...new Set(mergedMoments.map(nft => nft.playerName).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    
    return {
      tierOptions: tierOptions || [],
      seriesOptions: seriesOptions || [],
      teamOptions: teamOptions || [],
      playerOptions: playerOptions || []
    };
  }, [collectionType, moments, allDayMetadataCache]);

  // Initialize AllDay filters with all available options when data is loaded
  useEffect(() => {
    if (collectionType === 'allday' && allDayFilterOptions.tierOptions && allDayFilterOptions.seriesOptions) {
      // Only initialize if not already set (avoid overriding user selections)
      if (allDayFilter.selectedTiers.length === 0 && allDayFilter.selectedSeries.length === 0) {
        setAllDayFilter(prev => ({
          ...prev,
          selectedTiers: allDayFilterOptions.tierOptions || [],
          selectedSeries: allDayFilterOptions.seriesOptions || [],
        }));
      }
    }
  }, [collectionType, allDayFilterOptions.tierOptions, allDayFilterOptions.seriesOptions, allDayFilter.selectedTiers.length, allDayFilter.selectedSeries.length]);

  // Reset AllDay filters when switching accounts (but not when filters change)
  const [previousAccount, setPreviousAccount] = useState(selectedAccount);
  useEffect(() => {
    if (collectionType === 'allday' && selectedAccount !== previousAccount) {
      // Account has changed, reset filters
      if (allDayFilterOptions.tierOptions && allDayFilterOptions.seriesOptions) {
        setAllDayFilter(prev => ({
          ...prev,
          selectedTiers: allDayFilterOptions.tierOptions || [],
          selectedSeries: allDayFilterOptions.seriesOptions || [],
          selectedTeam: "All",
          selectedPlayer: "All",
          lockedStatus: "All",
          currentPage: 1,
        }));
      }
      setPreviousAccount(selectedAccount);
    }
  }, [selectedAccount, collectionType, allDayFilterOptions.tierOptions, allDayFilterOptions.seriesOptions, previousAccount]);

  // MY COLLECTION SPECIFIC: Use the moment filters hook with all tiers allowed
  // NOTE: This configuration is ONLY for My Collection page
  // - allowAllTiers: true (shows rare/legendary/ultimate, unlike NFT→TSHOT which uses false)
  // - showLockedMoments: true (shows locked moments, unlike other flows which use false)
  // - selectedNFTs: [] (no selection needed for collection viewing)
  const {
    filter,
    setFilter,
    tierOptions,
    seriesOptions,
    leagueOptions,
    setNameOptions,
    teamOptions,
    playerOptions,
    subeditionOptions,
    subMeta,
    eligibleMoments: topShotEligibleMoments,
  } = useMomentFilters({
    nftDetails: collectionType === 'topshot' ? moments : [], // Only use TopShot moments for TopShot filtering
    selectedNFTs: [], // No selection needed for collection view
    allowAllTiers: true, // Show all tiers, not just common/fandom
    showLockedMoments: true, // Show locked moments in collection view
    scope: "myCollection", // Separate storage scope from MomentSelection
    defaultFilters: {
      excludeSpecialSerials: false, // Don't exclude special serials by default in MyCollection
      excludeLowSerials: false, // Don't exclude low serials by default in MyCollection
    },
  });

  // For AllDay, merge Flow data with metadata and apply basic filtering
  const allDayEligibleMoments = useMemo(() => {
    if (collectionType !== 'allday') return [];
    
    // Merge Flow NFT data with metadata from API
    const mergedMoments = moments.map(nft => {
      const metadata = allDayMetadataCache[nft.editionID] || {};
      
      return {
        ...nft,
        ...metadata,
        // Ensure we have the core NFT fields
        id: nft.id,
        editionID: nft.editionID,
        serialNumber: nft.serialNumber,
        tier: nft.tier
      };
    });

    // Apply basic filtering for AllDay
    const filteredMoments = mergedMoments.filter(nft => {
      // Filter by tier if specified
      if (allDayFilter.selectedTiers && allDayFilter.selectedTiers.length > 0 && !allDayFilter.selectedTiers.includes(nft.tier?.toLowerCase())) {
        return false;
      }
      
      // Filter by series if specified
      if (allDayFilter.selectedSeries && allDayFilter.selectedSeries.length > 0 && !allDayFilter.selectedSeries.includes(nft.series)) {
        return false;
      }
      
      // Filter by team if specified
      if (allDayFilter.selectedTeam && allDayFilter.selectedTeam !== "All" && nft.teamName !== allDayFilter.selectedTeam) {
        return false;
      }
      
      // Filter by player if specified
      if (allDayFilter.selectedPlayer && allDayFilter.selectedPlayer !== "All" && nft.playerName !== allDayFilter.selectedPlayer) {
        return false;
      }
      
      // Filter by locked status if specified
      if (allDayFilter.lockedStatus && allDayFilter.lockedStatus !== "All") {
        const isLocked = nft.isLocked || false;
        if (allDayFilter.lockedStatus === "Locked" && !isLocked) return false;
        if (allDayFilter.lockedStatus === "Unlocked" && isLocked) return false;
      }
      
      return true;
    });

    // Apply sorting
    return filteredMoments.sort((a, b) => {
      if (allDayFilter.sortBy === "highest-serial") {
        return Number(b.serialNumber) - Number(a.serialNumber);
      } else {
        // Default to lowest-serial
        return Number(a.serialNumber) - Number(b.serialNumber);
      }
    });
  }, [collectionType, moments, allDayMetadataCache, allDayFilter]);

  // Use the appropriate eligible moments based on collection type
  const eligibleMoments = collectionType === 'topshot' ? topShotEligibleMoments : allDayEligibleMoments;

  // Pagination
  const PER_PAGE = 30;
  const currentPage = collectionType === 'topshot' ? filter.currentPage : allDayFilter.currentPage;
  const pageCount = Math.ceil(eligibleMoments.length / PER_PAGE);
  const pageSlice = eligibleMoments.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const goPage = (p) => {
    if (collectionType === 'topshot') {
      setFilter({ currentPage: p });
    } else {
      setAllDayFilter({ ...allDayFilter, currentPage: p });
    }
  };

  // Sort options
  const sortOptions = [
    { value: "lowest-serial", label: "Lowest Serial First" },
    { value: "highest-serial", label: "Highest Serial First" },
  ];

  // Early exits
  if (!user?.loggedIn) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-brand-text mb-4">My Collection</h1>
          <p className="text-brand-text/70">Please log in to view your collection.</p>
        </div>
      </PageWrapper>
    );
  }

  if (!accountData?.hasCollection && !isRefreshing && accountData?.parentAddress) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-brand-text mb-4">My Collection</h1>
          <div className="bg-brand-primary p-6 rounded-lg max-w-md mx-auto">
            <p className="text-brand-text/80 mb-4">
              This account does not have a Top Shot collection, or it's still loading.
            </p>
            <button
              onClick={() => dispatch({ type: "REFRESH_USER_DATA" })}
              disabled={isRefreshing}
              className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isRefreshing ? "Refreshing..." : "Try Refresh"}
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <Helmet>
        <title>Vaultopolis - My Collection</title>
        <meta name="description" content="View and manage your NBA Top Shot collection with advanced filtering and sorting options." />
        <meta name="keywords" content="NBA Top Shot, collection, moments, filtering, vaultopolis" />
        <link rel="canonical" href="https://vaultopolis.com/my-collection" />
        
        {/* Open Graph */}
        <meta property="og:title" content="My Collection | Vaultopolis" />
        <meta property="og:description" content="View and manage your NBA Top Shot collection with advanced filtering options." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaultopolis.com/my-collection" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "My Collection",
            "description": "View and manage your NBA Top Shot collection with advanced filtering options.",
            "url": "https://vaultopolis.com/my-collection"
          })}
        </script>
      </Helmet>

      <div className="w-full pt-4">
          {/* Collection Type Tabs */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-brand-primary rounded-lg p-2" role="tablist" aria-label="Collection sections">
                <button
                  onClick={() => setCollectionType('topshot')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                    collectionType === 'topshot'
                      ? 'border-brand-accent text-brand-accent bg-brand-secondary'
                      : 'border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-blue'
                  }`}
                >
                  <span className="text-sm sm:text-base">Top Shot</span>
                </button>
                
                <button
                  onClick={() => setCollectionType('allday')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                    collectionType === 'allday'
                      ? 'border-brand-accent text-brand-accent bg-brand-secondary'
                      : 'border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-blue'
                  }`}
                >
                  <span className="text-sm sm:text-base">All Day</span>
                </button>
              </div>
            </div>
          </div>

          {/* Account Selection */}
          <div className="mb-6">
            <AccountSelection
              parentAccount={{ 
                addr: accountData?.parentAddress, 
                hasCollection: accountData?.hasCollection, 
                ...accountData 
              }}
              childrenAddresses={accountData?.childrenAddresses}
              childrenAccounts={accountData?.childrenData}
              selectedAccount={selectedAccount}
              onSelectAccount={(addr) => {
                const isChild = accountData?.childrenAddresses?.includes(addr);
                dispatch({ type: "SET_SELECTED_ACCOUNT", payload: { address: addr, type: isChild ? "child" : "parent" } });
              }}
              isLoadingChildren={false}
            />
            </div>
          </div>


          {/* Filter Panel */}
          <div className="bg-brand-primary p-2 rounded-lg mb-6">
            <div className="bg-brand-secondary p-2 rounded-lg">
              {/* Filter Controls */}

              {/* Filter Controls - Only show for TopShot */}
              {collectionType === 'topshot' && (
                <>
                  {/* Row 1: Series */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm mr-1">Series:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFilter({ selectedSeries: [...seriesOptions], currentPage: 1 });
                        }}
                        className={`
                          px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                          transition-all duration-200 shadow-sm
                          ${filter.selectedSeries.length === seriesOptions.length && seriesOptions.length > 0
                            ? 'bg-brand-accent text-white'
                            : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                          }
                        `}
                      >
                        All
                      </button>
                      {seriesOptions.map((series) => {
                        const isSelected = filter.selectedSeries.includes(series);
                        // Count should show total moments for this series, regardless of selection
                        const count = moments.filter((m) =>
                          Number(m.series) === series
                        ).length;
                        return (
                          <button
                            key={series}
                            type="button"
                            onClick={() => {
                              const newSelection = isSelected
                                ? filter.selectedSeries.filter((s) => s !== series)
                                : [...filter.selectedSeries, series];
                              setFilter({ selectedSeries: newSelection, currentPage: 1 });
                            }}
                            className={`
                              px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                              transition-all duration-200 shadow-sm
                              ${isSelected
                                ? 'bg-brand-accent text-white'
                                : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                              }
                            `}
                          >
                            {getSeriesFilterLabel(series, 'topshot')}
                            {count !== null && (
                              <span className="ml-1.5 text-xs opacity-80">({count})</span>
                            )}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setFilter({ selectedSeries: [], currentPage: 1 });
                        }}
                        className={`
                          px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                          transition-all duration-200 shadow-sm
                          ${filter.selectedSeries.length === 0
                            ? 'bg-brand-accent text-white'
                            : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                          }
                        `}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Tiers & League */}
                  <div className="mt-3 pt-3 border-t border-brand-primary/30">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm mr-1">Tiers:</span>
                      {tierOptions.map((tier) => {
                        const isSelected = filter.selectedTiers.includes(tier);
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => {
                              const newSelection = isSelected
                                ? filter.selectedTiers.filter((t) => t !== tier)
                                : [...filter.selectedTiers, tier];
                              // Prevent empty selection - if would be empty, keep at least first tier
                              if (newSelection.length === 0 && tierOptions.length > 0) {
                                setFilter({ selectedTiers: [tierOptions[0]], currentPage: 1 });
                              } else {
                                setFilter({ selectedTiers: newSelection, currentPage: 1 });
                              }
                            }}
                            className={`
                              px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                              transition-all duration-200
                              ${isSelected
                                ? 'bg-brand-accent text-white shadow-md'
                                : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90 shadow-sm'
                              }
                            `}
                          >
                            {tier[0].toUpperCase() + tier.slice(1)}
                          </button>
                        );
                      })}
                      <span className="font-semibold text-xs sm:text-sm mr-1 ml-1">League:</span>
                      {leagueOptions.map((league) => {
                        const isSelected = Array.isArray(filter.selectedLeague)
                          ? filter.selectedLeague.includes(league)
                          : filter.selectedLeague === league;
                        return (
                          <button
                            key={league}
                            type="button"
                            onClick={() => {
                              const currentLeagues = Array.isArray(filter.selectedLeague) 
                                ? filter.selectedLeague 
                                : filter.selectedLeague === "All" 
                                  ? ["NBA", "WNBA"] 
                                  : [filter.selectedLeague];
                              const newSelection = isSelected
                                ? currentLeagues.filter((l) => l !== league)
                                : [...currentLeagues, league];
                              // Prevent deselecting all - if would be empty, select all instead
                              if (newSelection.length === 0) {
                                setFilter({ selectedLeague: ["NBA", "WNBA"], currentPage: 1 });
                              } else {
                                setFilter({ selectedLeague: newSelection, currentPage: 1 });
                              }
                            }}
                            className={`
                              px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                              transition-all duration-200 shadow-sm
                              ${isSelected
                                ? 'bg-brand-accent text-white'
                                : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                              }
                            `}
                          >
                            {league}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Row 4: Set, Team, Player, Parallel - Only show for TopShot */}
              {collectionType === 'topshot' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 gap-y-3 sm:gap-x-3 mt-3 pt-3 border-t border-brand-primary/30">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm min-w-[45px] sm:min-w-[50px]">Set:</span>
                    <FilterDropdown
                      options={["All", ...setNameOptions]}
                      value={filter.selectedSetName}
                      onChange={(e) =>
                        setFilter({ selectedSetName: e.target.value, currentPage: 1 })
                      }
                      title="Filter by set"
                      width="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm min-w-[45px] sm:min-w-[50px]">Team:</span>
                    <FilterDropdown
                      options={["All", ...teamOptions]}
                      value={filter.selectedTeam}
                      onChange={(e) =>
                        setFilter({ selectedTeam: e.target.value, currentPage: 1 })
                      }
                      title="Filter by team"
                      width="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm min-w-[45px] sm:min-w-[50px]">Player:</span>
                    <FilterDropdown
                      options={["All", ...playerOptions]}
                      value={filter.selectedPlayer}
                      onChange={(e) =>
                        setFilter({ selectedPlayer: e.target.value, currentPage: 1 })
                      }
                      title="Filter by player"
                      width="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm min-w-[45px] sm:min-w-[50px]">Parallel:</span>
                    <FilterDropdown
                      options={["All", ...subeditionOptions]}
                      value={filter.selectedSubedition}
                      onChange={(e) =>
                        setFilter({ selectedSubedition: e.target.value, currentPage: 1 })
                      }
                      title="Filter by parallel/subedition"
                      labelFn={(subId) => {
                        if (subId === "All") return "All";
                        const id = Number(subId);
                        const sub = subMeta[id] || SUBEDITIONS[id];
                        if (!sub) {
                          const count = topShotEligibleMoments.filter((m) => {
                            const effectiveSubId = (m.subeditionID === null || m.subeditionID === undefined) ? 0 : m.subeditionID;
                            return String(effectiveSubId) === String(subId);
                          }).length;
                          return `Subedition ${id} (${count})`;
                        }
                        const minted = sub.minted || 0;
                        const count = topShotEligibleMoments.filter((m) => {
                          const effectiveSubId = (m.subeditionID === null || m.subeditionID === undefined) ? 0 : m.subeditionID;
                          return String(effectiveSubId) === String(subId);
                        }).length;
                        return `${sub.name} /${minted} (${count})`;
                      }}
                      width="w-full"
                    />
                  </div>
                </div>
              )}


              {/* AllDay Filters */}
              {collectionType === 'allday' && (
                <>
                  {/* Series */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm mr-1">Series:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const allSeries = allDayFilterOptions.seriesOptions || [];
                          setAllDayFilter({ ...allDayFilter, selectedSeries: [...allSeries], currentPage: 1 });
                        }}
                        className={`
                          px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                          transition-all duration-200 shadow-sm
                          ${allDayFilter.selectedSeries.length === (allDayFilterOptions.seriesOptions || []).length && (allDayFilterOptions.seriesOptions || []).length > 0
                            ? 'bg-brand-accent text-white'
                            : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                          }
                        `}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAllDayFilter({ ...allDayFilter, selectedSeries: [], currentPage: 1 });
                        }}
                        className={`
                          px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                          transition-all duration-200 shadow-sm
                          ${allDayFilter.selectedSeries.length === 0
                            ? 'bg-brand-accent text-white'
                            : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                          }
                        `}
                      >
                        Clear All
                      </button>
                      {(allDayFilterOptions.seriesOptions || []).map((series) => {
                        const isSelected = allDayFilter.selectedSeries.includes(series);
                        return (
                          <button
                            key={series}
                            type="button"
                            onClick={() => {
                              const newSelection = isSelected
                                ? allDayFilter.selectedSeries.filter((s) => s !== series)
                                : [...allDayFilter.selectedSeries, series];
                              setAllDayFilter({ ...allDayFilter, selectedSeries: newSelection, currentPage: 1 });
                            }}
                            className={`
                              px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                              transition-all duration-200 shadow-sm
                              ${isSelected
                                ? 'bg-brand-accent text-white'
                                : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                              }
                            `}
                          >
                            {getSeriesFilterLabel(series, 'allday')}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setAllDayFilter({ ...allDayFilter, selectedSeries: [], currentPage: 1 });
                        }}
                        className={`
                          px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                          transition-all duration-200 shadow-sm
                          ${allDayFilter.selectedSeries.length === 0
                            ? 'bg-brand-accent text-white'
                            : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
                          }
                        `}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Tiers */}
                  <div className="mt-3 pt-3 border-t border-brand-primary/30">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm mr-1">Tiers:</span>
                      {(allDayFilterOptions.tierOptions || []).map((tier) => {
                        const isSelected = allDayFilter.selectedTiers.includes(tier);
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => {
                              const newSelection = isSelected
                                ? allDayFilter.selectedTiers.filter((t) => t !== tier)
                                : [...allDayFilter.selectedTiers, tier];
                              // Prevent empty selection - if would be empty, keep at least first tier
                              if (newSelection.length === 0 && (allDayFilterOptions.tierOptions || []).length > 0) {
                                setAllDayFilter({ ...allDayFilter, selectedTiers: [(allDayFilterOptions.tierOptions || [])[0]], currentPage: 1 });
                              } else {
                                setAllDayFilter({ ...allDayFilter, selectedTiers: newSelection, currentPage: 1 });
                              }
                            }}
                            className={`
                              px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium
                              transition-all duration-200
                              ${isSelected
                                ? 'bg-brand-accent text-white shadow-md'
                                : 'bg-brand-primary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90 shadow-sm'
                              }
                            `}
                          >
                            {tier[0].toUpperCase() + tier.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* AllDay Other Filters */}
              {collectionType === 'allday' && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-2 gap-y-3 sm:gap-x-3 mt-3 pt-3 border-t border-brand-primary/30">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm min-w-[45px] sm:min-w-[50px]">Team:</span>
                    <select
                      value={allDayFilter.selectedTeam}
                      onChange={(e) =>
                        setAllDayFilter({ ...allDayFilter, selectedTeam: e.target.value, currentPage: 1 })
                      }
                      className="w-full bg-brand-primary text-brand-text rounded px-1 py-0.5 disabled:opacity-40 text-xs"
                    >
                      <option value="All">All</option>
                      {(allDayFilterOptions.teamOptions || []).map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="font-semibold text-xs sm:text-sm min-w-[45px] sm:min-w-[50px]">Player:</span>
                    <select
                      value={allDayFilter.selectedPlayer}
                      onChange={(e) =>
                        setAllDayFilter({ ...allDayFilter, selectedPlayer: e.target.value, currentPage: 1 })
                      }
                      className="w-full bg-brand-primary text-brand-text rounded px-1 py-0.5 disabled:opacity-40 text-xs"
                    >
                      <option value="All">All</option>
                      {(allDayFilterOptions.playerOptions || []).map((player) => (
                        <option key={player} value={player}>
                          {player}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Show Metadata Toggle */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-brand-primary/30">
                <label className="flex items-center gap-1 text-base">
                  <input
                    type="checkbox"
                    checked={showMetadata}
                    onChange={(e) => setShowMetadata(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-white">Show On-Chain Metadata</span>
                </label>
              </div>

              {/* Bottom section with sort, refresh, and reset */}
              <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-brand-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-text/70">Sort:</span>
                      <select
                        value={collectionType === 'topshot' ? filter.sortBy : allDayFilter.sortBy}
                        onChange={(e) => {
                          if (collectionType === 'topshot') {
                            setFilter({ ...filter, sortBy: e.target.value, currentPage: 1 });
                          } else {
                            setAllDayFilter({ ...allDayFilter, sortBy: e.target.value, currentPage: 1 });
                          }
                        }}
                        className="bg-brand-primary text-brand-text rounded px-1 py-0.5 text-xs border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (collectionType === 'topshot') {
                          refreshUserData();
                        } else if (collectionType === 'allday') {
                          refreshAllDayData();
                        }
                      }}
                      disabled={collectionType === 'topshot' ? isRefreshing : isRefreshingAllDay}
                      className="p-1 rounded-full hover:bg-flow-dark/10 disabled:opacity-40 focus-visible:ring focus-visible:ring-flow-dark/60 select-none"
                      title={`Refresh ${collectionType === 'topshot' ? 'TopShot' : 'AllDay'} data`}
                    >
                      <FaSyncAlt size={16} className={`${(collectionType === 'topshot' ? isRefreshing : isRefreshingAllDay) ? "animate-spin" : ""} text-opolis`} />
                    </button>
                    <button
                      onClick={() => {
                        if (collectionType === 'topshot') {
                          setFilter({
                            selectedTiers: tierOptions,
                            selectedSeries: seriesOptions,
                            selectedSetName: "All",
                            selectedLeague: "All",
                            selectedTeam: "All",
                            selectedPlayer: "All",
                            lockedStatus: "All",
                            sortBy: "lowest-serial",
                            currentPage: 1,
                          });
                        } else {
                          setAllDayFilter({
                            selectedTiers: [],
                            selectedSeries: [],
                            selectedTeam: "All",
                            selectedPlayer: "All",
                            lockedStatus: "All",
                            sortBy: "lowest-serial",
                            currentPage: 1,
                          });
                        }
                        setShowMetadata(false);
                      }}
                      className="px-1.5 py-0.5 bg-brand-primary rounded hover:opacity-80 text-xs"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {pageCount > 1 && (
            <div className="flex justify-between items-center mb-2 text-sm text-brand-text/70">
              <p>
                Showing {pageSlice.length} of {eligibleMoments.length.toLocaleString()} items
              </p>
              <p>
                Page {currentPage} of {pageCount}
              </p>
            </div>
          )}

          {/* Moments Display */}
          <div className="bg-brand-primary text-brand-text p-2 rounded w-full">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
            {pageSlice.map((moment) => {
              if (collectionType === 'allday') {
                return (
                  <AllDayMomentCard
                    key={moment.id || moment.editionID}
                    nft={moment}
                    handleNFTSelection={() => {}} // No selection needed for collection view
                    isSelected={false}
                    disableHover={true} // Disable hover states for collection view
                    showMetadata={showMetadata}
                  />
                );
              } else {
                return (
                  <MomentCard
                    key={moment.id}
                    nft={moment}
                    handleNFTSelection={() => {}} // No selection needed for collection view
                    isSelected={false}
                    disableHover={true} // Disable hover states for collection view
                    collectionType={collectionType} // Pass collection type to MomentCard
                    showMetadata={showMetadata}
                  />
                );
              }
            })}
          </div>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <button
                  onClick={() => goPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 rounded-lg font-semibold transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                  Page {currentPage} of {pageCount}
                </span>
                <button
                  onClick={() => goPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="px-4 py-2 bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 rounded-lg font-semibold transition-colors"
                >
                  Next
                </button>
            </div>
          )}
    </>
  );
}
