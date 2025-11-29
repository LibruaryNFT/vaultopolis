import React, { useContext, useMemo, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { RefreshCw, Loader2 } from "lucide-react";
import { UserDataContext } from "../context/UserContext";
import { useAllDayContext } from "../context/AllDayContext";
import MomentCard from "../components/MomentCard";
import AllDayMomentCard from "../components/AllDayMomentCard";
import MomentCardSkeleton from "../components/MomentCardSkeleton";
import AccountSelection from "../components/AccountSelection";
import { useMomentFilters, WNBA_TEAMS } from "../hooks/useMomentFilters";
import PageWrapper from "../components/PageWrapper";
import { getSeriesFilterLabel } from "../utils/seriesNames";
import { SUBEDITIONS } from "../utils/subeditions";
import MultiSelectFilterPopover from "../components/MultiSelectFilterPopover";
import PageInput from "../components/PageInput";
import { X } from "lucide-react";
 



export default function MyCollection({
  isOwnProfile = true,
  source = "topshot",
  onSourceChange,
}) {
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
  const normalizeSource = (value) => (value === 'allday' ? 'allday' : 'topshot');
  const [collectionType, setCollectionType] = useState(normalizeSource(source));
  useEffect(() => {
    setCollectionType(normalizeSource(source));
  }, [source]);

  const handleSelectCollectionSource = (next) => {
    const normalized = normalizeSource(next);
    setCollectionType(normalized);
    onSourceChange?.(normalized);
  };

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
    base,
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

      <div className="w-full text-white space-y-2 mb-2">
        <div className="w-full p-0 space-y-1.5">
          {/* Header */}
          <div className="px-1 pt-2">
            <h1 className="text-lg sm:text-2xl font-semibold text-brand-text">
              My Collection
            </h1>
          </div>

          {/* Privacy note */}
          {isOwnProfile && (
            <div className="px-1 mt-1 mb-3 py-2 flex items-start gap-3">
              <span className="text-xl leading-none pt-0.5">🔒</span>
              <div>
                <p className="text-sm font-semibold text-brand-text m-0">Private collection view</p>
                <p className="text-xs text-brand-text/70 m-0">
                  Only you can see this inventory when you're logged in. Switch tabs to share public portfolio stats instead.
                </p>
              </div>
            </div>
          )}

          {/* Account Selection */}
          <div className="px-1 py-0.5 pt-2 border-t border-brand-border/30 flex flex-wrap gap-2 w-full">
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

          {/* Collection Selection */}
          <div className="px-1 py-0.5 pt-2 flex flex-wrap gap-2 w-full">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold text-brand-text whitespace-nowrap">Select Collection:</span>
              <div
                className="inline-flex items-center gap-1 bg-brand-primary rounded-lg p-0.5 border border-brand-border/60"
                role="tablist"
                aria-label="Collection source"
              >
                <button
                  onClick={() => handleSelectCollectionSource('topshot')}
                  role="tab"
                  aria-selected={collectionType === 'topshot'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    collectionType === 'topshot'
                      ? 'bg-brand-secondary text-brand-accent border border-brand-accent shadow-sm'
                      : 'text-brand-text/80 border border-transparent hover:bg-brand-secondary/60'
                  }`}
                >
                  Top Shot
                </button>
                <button
                  onClick={() => handleSelectCollectionSource('allday')}
                  role="tab"
                  aria-selected={collectionType === 'allday'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    collectionType === 'allday'
                      ? 'bg-brand-secondary text-brand-accent border border-brand-accent shadow-sm'
                      : 'text-brand-text/80 border border-transparent hover:bg-brand-secondary/60'
                  }`}
                >
                  All Day
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="text-brand-text w-full">
            {/* Filter Sections */}
            <div className="space-y-1.5">
              {/* Filter Controls - Only show for TopShot */}
              {collectionType === 'topshot' && (
                <div>
                  {/* Unified filter row */}
                  <div className="px-1 pt-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <MultiSelectFilterPopover
                          label="Series"
                          selectedValues={filter.selectedSeries}
                          options={seriesOptions}
                          placeholder="Search series..."
                          onChange={(values) =>
                            setFilter({ selectedSeries: values.map(Number), currentPage: 1 })
                          }
                          formatOption={(series) =>
                            getSeriesFilterLabel(Number(series), "topshot")
                          }
                          getCount={(series) =>
                            series === "All"
                              ? topShotEligibleMoments.length
                              : topShotEligibleMoments.filter((m) => Number(m.series) === Number(series))
                                  .length
                          }
                        />
                        <MultiSelectFilterPopover
                          label="Tier"
                          selectedValues={filter.selectedTiers}
                          options={tierOptions}
                          placeholder="Search tiers..."
                          onChange={(values) => {
                            const next =
                              values.length || !tierOptions.length
                                ? values
                                : [tierOptions[0]];
                            setFilter({ selectedTiers: next, currentPage: 1 });
                          }}
                          formatOption={(tier) =>
                            tier ? tier[0].toUpperCase() + tier.slice(1) : tier
                          }
                          getCount={(tier) =>
                            tier === "All"
                              ? topShotEligibleMoments.length
                              : topShotEligibleMoments.filter((m) => (m.tier || "").toLowerCase() === tier.toLowerCase()).length
                          }
                          minSelection={1}
                        />
                        <MultiSelectFilterPopover
                          label="League"
                          selectedValues={
                            Array.isArray(filter.selectedLeague)
                              ? filter.selectedLeague
                              : filter.selectedLeague === "All"
                              ? leagueOptions
                              : [filter.selectedLeague]
                          }
                          options={leagueOptions}
                          placeholder="Search leagues..."
                          onChange={(values) => {
                            const sanitized = values.length ? values : leagueOptions;
                            setFilter({ selectedLeague: sanitized, currentPage: 1 });
                          }}
                          getCount={(league) =>
                            league === "All"
                              ? topShotEligibleMoments.length
                              : topShotEligibleMoments.filter((m) =>
                                  league === "WNBA"
                                    ? WNBA_TEAMS.includes(m.teamAtMoment || "")
                                    : !WNBA_TEAMS.includes(m.teamAtMoment || "")
                                ).length
                          }
                          minSelection={1}
                        />
                        <MultiSelectFilterPopover
                          label="Set"
                          selectedValues={Array.isArray(filter.selectedSetName) ? filter.selectedSetName : filter.selectedSetName === "All" ? [] : [filter.selectedSetName]}
                          options={setNameOptions}
                          placeholder="Search sets..."
                          onChange={(values) =>
                            setFilter({ selectedSetName: values, currentPage: 1 })
                          }
                          formatOption={(setName) => setName}
                          getCount={(setName) =>
                            setName === "All"
                              ? base?.baseNoSet?.length || 0
                              : base?.baseNoSet?.filter((m) => m.name === setName).length || 0
                          }
                          emptyMeansAll={true}
                        />
                        <MultiSelectFilterPopover
                          label="Team"
                          selectedValues={Array.isArray(filter.selectedTeam) ? filter.selectedTeam : filter.selectedTeam === "All" ? [] : [filter.selectedTeam]}
                          options={teamOptions}
                          placeholder="Search teams..."
                          onChange={(values) =>
                            setFilter({ selectedTeam: values, currentPage: 1 })
                          }
                          formatOption={(team) => team}
                          getCount={(team) =>
                            team === "All"
                              ? base?.baseNoTeam?.length || 0
                              : base?.baseNoTeam?.filter((m) => m.teamAtMoment === team).length || 0
                          }
                          emptyMeansAll={true}
                        />
                        <MultiSelectFilterPopover
                          label="Player"
                          selectedValues={Array.isArray(filter.selectedPlayer) ? filter.selectedPlayer : filter.selectedPlayer === "All" ? [] : [filter.selectedPlayer]}
                          options={playerOptions}
                          placeholder="Search players..."
                          onChange={(values) =>
                            setFilter({ selectedPlayer: values, currentPage: 1 })
                          }
                          formatOption={(player) => player}
                          getCount={(player) =>
                            player === "All"
                              ? base?.baseNoPlayer?.length || 0
                              : base?.baseNoPlayer?.filter((m) => m.fullName === player).length || 0
                          }
                          emptyMeansAll={true}
                        />
                        <MultiSelectFilterPopover
                          label="Parallel"
                          selectedValues={Array.isArray(filter.selectedSubedition) ? filter.selectedSubedition.map(String) : filter.selectedSubedition === "All" ? [] : [String(filter.selectedSubedition)]}
                          options={subeditionOptions}
                          placeholder="Search parallels..."
                          onChange={(values) =>
                            setFilter({ selectedSubedition: values, currentPage: 1 })
                          }
                          formatOption={(subId) => {
                            if (subId === "All") return "All";
                            const id = Number(subId);
                            const sub = subMeta[id] || SUBEDITIONS[id];
                            if (!sub) {
                              const count = base?.baseNoSub?.filter((m) => {
                                const effectiveSubId = (m.subeditionID === null || m.subeditionID === undefined) ? 0 : m.subeditionID;
                                return String(effectiveSubId) === String(subId);
                              }).length || 0;
                              return `Subedition ${id} (${count})`;
                            }
                            const minted = sub.minted || 0;
                            const count = base?.baseNoSub?.filter((m) => {
                              const effectiveSubId = (m.subeditionID === null || m.subeditionID === undefined) ? 0 : m.subeditionID;
                              return String(effectiveSubId) === String(subId);
                            }).length || 0;
                            return `${sub.name} /${minted} (${count})`;
                          }}
                          getCount={(subId) => {
                            if (subId === "All") return base?.baseNoSub?.length || 0;
                            return base?.baseNoSub?.filter((m) => {
                              const effectiveSubId = (m.subeditionID === null || m.subeditionID === undefined) ? 0 : m.subeditionID;
                              return String(effectiveSubId) === String(subId);
                            }).length || 0;
                          }}
                          emptyMeansAll={true}
                        />
                      </div>
                    </div>
                  </div>
              )}


              {/* Show Metadata Toggle */}
              <div className="px-1 flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                  <label className="flex items-center gap-1 text-base">
                    <input
                      type="checkbox"
                      checked={showMetadata}
                      onChange={(e) => setShowMetadata(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-brand-text">Show On-Chain Metadata</span>
                  </label>
                </div>

              {/* Bottom section with sort, refresh, and reset */}
              <div className="px-1 flex flex-col gap-2 pt-2">
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
                        className="bg-brand-primary text-brand-text rounded px-1 py-0.5 text-xs border border-brand-border focus:outline-none focus:ring-2 focus:ring-opolis"
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
                      className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-secondary px-2.5 py-1.5 text-xs font-medium text-brand-text hover:border-opolis focus-visible:ring-2 focus-visible:ring-opolis disabled:opacity-40 select-none h-[28px]"
                      title={`Refresh ${collectionType === 'topshot' ? 'TopShot' : 'AllDay'} data`}
                    >
                      <RefreshCw size={14} className={`${(collectionType === 'topshot' ? isRefreshing : isRefreshingAllDay) ? "animate-spin" : ""} text-opolis`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => {
                        if (collectionType === 'topshot') {
                          setFilter({
                            selectedTiers: tierOptions,
                            selectedSeries: seriesOptions,
                            selectedSetName: "All",
                            selectedLeague: leagueOptions,
                            selectedTeam: "All",
                            selectedPlayer: "All",
                            selectedSubedition: "All",
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
                      className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-secondary px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-text hover:border-opolis focus-visible:ring-2 focus-visible:ring-opolis transition h-[28px]"
                    >
                      <X size={13} />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider below sort section */}
          <div className="border-t border-brand-border/30 my-3 -mx-1 w-[calc(100%+0.5rem)]" />

          {/* Top pagination - "Showing X of Y" on same row as controls */}
          {pageCount > 1 && (
            <div className="px-1 flex flex-row justify-between items-center gap-2 sm:gap-3 mb-1.5">
              {/* "Showing X of Y items" text - hide "Showing" on mobile */}
              <p className="text-sm text-brand-text/70 whitespace-nowrap">
                <span className="hidden sm:inline">Showing </span>
                {pageSlice.length} of {eligibleMoments.length.toLocaleString()}<span className="hidden sm:inline"> items</span>
              </p>
              
              {/* Mobile: Simple Prev/Next with compact indicator */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => goPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Prev
                </button>
                <span className="text-xs text-brand-text/70 px-2">
                  {currentPage}/{pageCount}
                </span>
                <button
                  onClick={() => goPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Next
                </button>
              </div>

              {/* Desktop: Full pagination with PageInput */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    onClick={() => goPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="h-[1px] w-8 bg-brand-primary/30" />
                <PageInput
                  maxPages={pageCount}
                  currentPage={currentPage}
                  onPageChange={goPage}
                  disabled={false}
                />
              </div>
            </div>
          )}

          {/* Moments Display */}
          <div className="text-brand-text w-full relative px-1">
            {/* Refresh indicator overlay */}
            {((collectionType === 'topshot' && isRefreshing) || (collectionType === 'allday' && isRefreshingAllDay)) && eligibleMoments.length > 0 && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-xs text-brand-text/70 bg-brand-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-brand-border shadow-md">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading...</span>
              </div>
            )}
            {/* Show skeletons during initial load or refresh when no data */}
            {((collectionType === 'topshot' && isRefreshing && eligibleMoments.length === 0) || 
              (collectionType === 'allday' && isRefreshingAllDay && eligibleMoments.length === 0)) ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
                {[...Array(20)].map((_, i) => (
                  <MomentCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : (
              <div className={`grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center ${((collectionType === 'topshot' && isRefreshing) || (collectionType === 'allday' && isRefreshingAllDay)) && eligibleMoments.length > 0 ? 'opacity-60' : ''}`}>
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
            )}
          </div>

          {/* Pagination (modern style, matches MomentSelection) */}
          {pageCount > 1 && (
            <div className="px-1 flex flex-row justify-between items-center gap-2 sm:gap-3 mt-4">
              {/* "Showing X of Y items" text - hide "Showing" on mobile */}
              <p className="text-sm text-brand-text/70 whitespace-nowrap">
                <span className="hidden sm:inline">Showing </span>
                {pageSlice.length} of {eligibleMoments.length.toLocaleString()}<span className="hidden sm:inline"> items</span>
              </p>
              
              {/* Mobile: Simple Prev/Next with compact indicator */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => goPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Prev
                </button>
                <span className="text-xs text-brand-text/70 px-2">
                  {currentPage}/{pageCount}
                </span>
                <button
                  onClick={() => goPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Next
                </button>
              </div>

              {/* Desktop: Full pagination with PageInput */}
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                    Page {currentPage} of {pageCount}
                  </span>
                  <button
                    onClick={() => goPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="h-[1px] w-8 bg-brand-primary/30" />
                {/* Simple inline page input for quick jumps */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={currentPage}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val) && val >= 1 && val <= pageCount) {
                        goPage(val);
                      }
                    }}
                    className="w-16 px-2 py-1 rounded bg-brand-primary text-brand-text/80 text-sm border border-brand-border focus:outline-none focus:ring-2 focus:ring-opolis"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
