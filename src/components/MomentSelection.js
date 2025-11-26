/* eslint-disable react/prop-types */
import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Settings as SettingsIcon, RefreshCw, X } from "lucide-react";
import { UserDataContext } from "../context/UserContext";
import MomentCard from "./MomentCard";
import { useMomentFilters, WNBA_TEAMS } from "../hooks/useMomentFilters";
import { getSeriesFilterLabel } from "../utils/seriesNames";
import { SUBEDITIONS } from "../utils/subeditions";
import FilterPopover from "./FilterPopover";
import MultiSelectFilterPopover from "./MultiSelectFilterPopover";

/* ───── local exclude-set helpers ───── */
const exclKey = (addr) => `excluded:${addr?.toLowerCase?.()}`;
const readExcluded = (addr) => {
  try {
    const raw = localStorage.getItem(exclKey(addr));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

/* ───── reusable dropdown - deprecated, use FilterDropdown instead ───── */

/* ───── preset-modal (unchanged) ───── */
const sanitizeName = (s) =>
  s
    .replace(/<\/?[^>]*>/g, "")
    .replace(/[^\w\s-]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

function PrefsModal({
  prefs,
  current,
  apply,
  save,
  del,
  onClose,
  newName,
  setNewName,
  maxNameLength,
}) {
  const [err, setErr] = useState("");

  const trySave = () => {
    const clean = sanitizeName(newName);
    if (!clean) return setErr("Name required");
    if (
      !Object.keys(prefs).every((k) => k.toLowerCase() !== clean.toLowerCase())
    )
      return setErr("Name already exists");
    if (!save(clean)) return setErr("Could not save (quota?)");
    setNewName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-brand-primary p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Filter preferences</h3>

        {Object.keys(prefs).length > 0 && (
          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-1">
            {Object.keys(prefs).map((k) => (
              <div key={k} className="flex items-center">
                <button
                  onClick={() => {
                    apply(k);
                    onClose();
                  }}
                  className={`flex-1 text-left px-2 py-1 rounded ${
                    k === current
                      ? "bg-flow-dark text-white"
                      : "hover:bg-brand-secondary"
                  }`}
                >
                  {k}
                </button>
                <button
                  onClick={() => del(k)}
                  className="ml-2 px-2 text-red-500 hover:bg-red-500/10 rounded"
                  title="Delete preference"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          value={newName}
          onChange={(e) => {
            setErr("");
            setNewName(e.target.value);
          }}
          placeholder="New preference name"
          className="w-full bg-brand-secondary px-3 py-2 rounded mb-2"
          maxLength={maxNameLength}
        />
        {err && <p className="text-xs text-red-500 mb-3">{err}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-secondary rounded"
          >
            Close
          </button>
          <button
            onClick={trySave}
            className={`px-4 py-2 rounded ${
              newName.trim()
                ? "bg-flow-dark text-white hover:opacity-90"
                : "bg-brand-secondary opacity-40 cursor-not-allowed"
            }`}
          >
            Save current
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── helper: format elapsed time ───── */
function formatElapsed(ts) {
  if (!ts) return "never";
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} d ago`;
}

const PageInput = ({ maxPages, currentPage, onPageChange, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleSubmit = () => {
    const newPage = parseInt(inputValue, 10);
    if (
      newPage &&
      newPage >= 1 &&
      newPage <= maxPages &&
      newPage !== currentPage
    ) {
      onPageChange(newPage);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Page #"
          className="w-16 px-2 py-1 rounded bg-brand-primary text-brand-text/80 text-sm"
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled}
        className="px-4 py-2 sm:px-3 sm:py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm min-h-[44px] sm:min-h-0"
      >
        Go
      </button>
    </div>
  );
};

/* ───── main component ───── */
export default function MomentSelection(props) {
  const {
    user,
    accountData,
    selectedNFTs,
    dispatch: appDispatch,
    isRefreshing,
    selectedAccount,
    selectedAccountType,
    // eslint-disable-next-line no-unused-vars
    loadChildData,
    refreshUserData,
    lastSuccessfulUpdate, // MODIFIED: Changed from lastCollectionLoad
  } = useContext(UserDataContext);

  // Allow parent to control if only common/fandom are shown (default: false)
  const restrictToCommonFandom = props.restrictToCommonFandom || false;

  /* live "x min ago" label */
  const [elapsed, setElapsed] = useState(formatElapsed(lastSuccessfulUpdate));
  useEffect(() => {
    setElapsed(formatElapsed(lastSuccessfulUpdate));
    const id = setInterval(
      () => setElapsed(formatElapsed(lastSuccessfulUpdate)),
      30_000
    );
    return () => clearInterval(id);
  }, [lastSuccessfulUpdate]);

  /* --- refresh cooldown (30 s) ------------------ */
  const [cooldown, setCooldown] = useState(false);
  const cooldownTimerRef = useRef(null);

  const handleRefresh = useCallback(() => {
    if (isRefreshing || cooldown) return;
    refreshUserData();
    setCooldown(true);
  }, [isRefreshing, cooldown, refreshUserData]);

  /* start cooldown AFTER refresh completes */
  useEffect(() => {
    if (!isRefreshing && cooldown && !cooldownTimerRef.current) {
      cooldownTimerRef.current = setTimeout(() => {
        setCooldown(false);
        cooldownTimerRef.current = null;
      }, 30_000);
    }
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [isRefreshing, cooldown]);

  /* 1️⃣ locate current child object */
  const childObj =
    selectedAccountType === "child"
      ? accountData?.childrenData?.find(
          (c) => c.addr?.toLowerCase?.() === selectedAccount?.toLowerCase?.()
        )
      : null;

  /* 2️⃣ get moments from the right place */
  const moments = childObj?.nftDetails || accountData?.nftDetails || [];

  // If restrictToCommonFandom, only allow common/fandom moments (for swap page)
  const filteredNFTs = restrictToCommonFandom
    ? moments.filter((m) => m.tier === "common" || m.tier === "fandom")
    : moments;

  // Exclude locally excluded moments
  const excluded = readExcluded(selectedAccount);
  const nftDetails = filteredNFTs.filter((m) => !excluded.has(m.id));

  /* safety filter overrides - must be declared before useMomentFilters */
  const [safetyOverrides, setSafetyOverrides] = useState(new Set());

  /* heavy filter hook */
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
    eligibleMoments,
    prefs,
    currentPrefKey,
    savePref,
    applyPref,
    deletePref,
  } = useMomentFilters({
    nftDetails,
    selectedNFTs,
    allowAllTiers: props.allowAllTiers || false,
    forceSortOrder: props.forceSortOrder || null,
    showLockedMoments: props.showLockedMoments !== undefined ? props.showLockedMoments : false,
    safetyOverrides,
  });

  /* pagination */
  const PER_PAGE = 30;
  const pageCount = Math.ceil(eligibleMoments.length / PER_PAGE);
  const pageSlice = eligibleMoments.slice(
    (filter.currentPage - 1) * PER_PAGE,
    filter.currentPage * PER_PAGE
  );

  const goPage = useCallback((p) => setFilter({ currentPage: p }), [setFilter]);

  // Reset page to 1 when switching accounts
  useEffect(() => {
    goPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount]);

  /* prefs modal */
  const [showPrefs, setShowPrefs] = useState(false);
  const [newPrefName, setNewPrefName] = useState("");

  // Reset overrides when series selection changes significantly
  const selectedSeriesKey = filter.selectedSeries.join(",");
  useEffect(() => {
    setSafetyOverrides(new Set());
  }, [selectedSeriesKey]);

  /* ───────── early exits ───────── */
  if (!user?.loggedIn)
    return <p className="text-brand-text/70 px-2">Please log in.</p>;

  // Display loading or error based on collectionLoadStatus from UserContext
  // This part can be enhanced based on how you want to use `collectionLoadStatus`
  // For now, just checking hasCollection after initial load attempts.

  if (
    !accountData.hasCollection &&
    !isRefreshing &&
    accountData.parentAddress
  ) {
    // Check parentAddress to ensure some load attempt happened
    return (
      <div className="bg-brand-primary p-2 rounded-lg">
        <p className="text-brand-text/80 text-sm">
          This account does not have a Top Shot collection, or it's still
          loading.
        </p>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || cooldown}
          className="mt-2 p-1 px-2 text-xs bg-flow-button-dark rounded hover:opacity-80 disabled:opacity-40"
        >
          {isRefreshing ? "Refreshing..." : "Try Refresh"}
        </button>
      </div>
    );
  }

  /* ───────── render ───────── */
  return (
    <div className="bg-brand-primary text-brand-text p-3 rounded-lg w-full space-y-3">
      {/* Filter Sections */}
      <div className="space-y-3">
        {/* Row 1: Safety Filters */}
        <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-xs sm:text-sm mr-1 whitespace-nowrap">
          Safety Exclusions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFilter({ excludeSpecialSerials: !filter.excludeSpecialSerials, currentPage: 1 })
            }
            className={`
              px-2.5 py-1.5 rounded-md text-[10px] sm:text-xs font-medium leading-tight
              transition-all duration-200 whitespace-normal h-[28px]
              ${filter.excludeSpecialSerials
                ? 'bg-brand-secondary border-2 border-opolis text-opolis shadow-md'
                : 'bg-brand-secondary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90 shadow-sm'
              }
            `}
          >
            #1 / Jersey / Last Mint
          </button>
          <button
            type="button"
            onClick={() =>
              setFilter({ excludeLowSerials: !filter.excludeLowSerials, currentPage: 1 })
            }
            className={`
              px-2.5 py-1.5 rounded-md text-[10px] sm:text-xs font-medium leading-tight
              transition-all duration-200 whitespace-normal shadow-sm h-[28px]
              ${filter.excludeLowSerials
                ? 'bg-brand-secondary border-2 border-opolis text-opolis'
                : 'bg-brand-secondary border border-brand-border text-brand-text hover:border-brand-accent hover:opacity-90'
              }
            `}
          >
            Serial ≤ 4000
          </button>
        </div>
      </div>
      {/* Row 2: Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || cooldown}
          title={
            cooldown
              ? "Please wait a few seconds before refreshing again"
              : "Refresh snapshots"
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-secondary px-2.5 py-1.5 text-xs font-medium text-brand-text hover:border-opolis focus-visible:ring-2 focus-visible:ring-opolis disabled:opacity-40 select-none h-[28px]"
        >
          <RefreshCw
            size={14}
            className={`${isRefreshing ? "animate-spin" : ""} text-opolis`}
          />
          <span>Refresh</span>
        </button>
        <span className="text-xs text-brand-text/70 h-[28px] flex items-center">
          Updated: <span className="text-brand-text ml-1">{elapsed}</span>
        </span>
        <button
          aria-label="Filter settings"
          onClick={() => setShowPrefs(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-secondary px-3 py-1.5 text-xs font-medium text-brand-text hover:border-opolis focus-visible:ring-2 focus-visible:ring-opolis transition h-[28px]"
        >
          <span className="text-xs text-brand-text/80">
            Filter:{" "}
            <span className="text-brand-text">
              {currentPrefKey || "None"}
            </span>
          </span>
          <SettingsIcon
            size={14}
            strokeWidth={2}
            className="text-opolis"
          />
        </button>
        <button
          onClick={() => {
            setFilter({
              selectedTiers: tierOptions,
              selectedSeries: seriesOptions,
              selectedSetName: "All",
              selectedLeague: leagueOptions,
              selectedTeam: "All",
              selectedPlayer: "All",
              selectedSubedition: "All",
              excludeSpecialSerials: true,
              excludeLowSerials: true,
              currentPage: 1,
            });
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-secondary px-3 py-1.5 text-xs sm:text-sm font-medium text-brand-text hover:border-opolis focus-visible:ring-2 focus-visible:ring-opolis transition h-[28px]"
        >
          <X size={13} />
          Reset Filters
        </button>
      </div>

      {/* Unified filter row */}
      <div className="pt-3 border-t border-brand-border/30">
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
                  ? eligibleMoments.length
                  : eligibleMoments.filter((m) => Number(m.series) === Number(series))
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
                  ? eligibleMoments.length
                  : eligibleMoments.filter((m) => (m.tier || "").toLowerCase() === tier.toLowerCase()).length
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
                  ? eligibleMoments.length
                  : eligibleMoments.filter((m) =>
                      league === "WNBA"
                        ? WNBA_TEAMS.includes(m.teamAtMoment || "")
                        : !WNBA_TEAMS.includes(m.teamAtMoment || "")
                    ).length
              }
              minSelection={1}
            />
            <FilterPopover
              label="Set"
              selectedValue={filter.selectedSetName}
              options={setNameOptions}
              placeholder="Search sets..."
              onChange={(value) =>
                setFilter({ selectedSetName: value, currentPage: 1 })
              }
              getCount={(setName) =>
                setName === "All"
                  ? eligibleMoments.length
                  : eligibleMoments.filter((m) => m.name === setName).length
              }
            />
            <FilterPopover
              label="Team"
              selectedValue={filter.selectedTeam}
              options={teamOptions}
              placeholder="Search teams..."
              onChange={(value) =>
                setFilter({ selectedTeam: value, currentPage: 1 })
              }
              getCount={(team) =>
                team === "All"
                  ? eligibleMoments.length
                  : eligibleMoments.filter((m) => m.teamAtMoment === team).length
              }
            />
            <FilterPopover
              label="Player"
              selectedValue={filter.selectedPlayer}
              options={playerOptions}
              placeholder="Search players..."
              onChange={(value) =>
                setFilter({ selectedPlayer: value, currentPage: 1 })
              }
              getCount={(player) =>
                player === "All"
                  ? eligibleMoments.length
                  : eligibleMoments.filter((m) => m.fullName === player).length
              }
            />
            <FilterPopover
              label="Parallel"
              selectedValue={filter.selectedSubedition}
              options={subeditionOptions}
              placeholder="Search parallels..."
              onChange={(value) =>
                setFilter({ selectedSubedition: value, currentPage: 1 })
              }
              formatOption={(subId) => {
                const id = Number(subId);
                const sub = subMeta[id] || SUBEDITIONS[id];
                if (!sub) {
                  return `Subedition ${id}`;
                }
                const minted = sub.minted || 0;
                return `${sub.name} /${minted}`;
              }}
              getCount={(subId) => {
                if (subId === "All") {
                  return eligibleMoments.length;
                }
                return eligibleMoments.filter((m) => {
                  const effectiveSubId =
                    m.subeditionID === null || m.subeditionID === undefined
                      ? 0
                      : m.subeditionID;
                  return String(effectiveSubId) === String(subId);
                }).length;
              }}
            />
        </div>
      </div>
        </div>
      )}
      {/* End of collapsible filter section */}

      {/* Selection limit warning */}
      {selectedNFTs.length >= 200 && (
        <div className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-sm text-yellow-300 text-center">
          Max 200 NFTs selected. Deselect some to add more.
        </div>
      )}

      {/* Divider between filters and results */}
      <div className="border-t border-brand-border/30 my-3" />

      {/* grid */}
      {pageCount > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mb-2 text-xs sm:text-sm text-brand-text/70">
          <p>
            Showing {pageSlice.length} of{" "}
            {eligibleMoments.length.toLocaleString()} items
          </p>
          <p className="sm:hidden">
            Page {filter.currentPage} of {pageCount}
          </p>
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
        {pageSlice.map((n) => (
          <MomentCard
            key={n.id}
            nft={n}
            handleNFTSelection={(id) => {
              // Prevent selecting more than 200 for NFT→TSHOT swaps
              const MAX_SELECTION = 200;
              if (!selectedNFTs.includes(id) && selectedNFTs.length >= MAX_SELECTION) {
                return; // Do nothing if already at limit
              }
              appDispatch({ type: "SET_SELECTED_NFTS", payload: id });
            }}
            isSelected={selectedNFTs.includes(n.id)}
          />
        ))}
      </div>

      {/* pagination */}
      {pageCount > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-4">
          {/* Mobile: Simple Prev/Next with compact indicator */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => goPage(filter.currentPage - 1)}
              disabled={filter.currentPage === 1}
              className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
            >
              Prev
            </button>
            <span className="text-xs text-brand-text/70 px-2">
              {filter.currentPage}/{pageCount}
            </span>
            <button
              onClick={() => goPage(filter.currentPage + 1)}
              disabled={filter.currentPage === pageCount}
              className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
            >
              Next
            </button>
          </div>
          {/* Desktop: Full pagination with PageInput */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(filter.currentPage - 1)}
                disabled={filter.currentPage === 1}
                className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                Page {filter.currentPage} of {pageCount}
              </span>
              <button
                onClick={() => goPage(filter.currentPage + 1)}
                disabled={filter.currentPage === pageCount}
                className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="h-[1px] w-8 bg-brand-primary/30" />
            <PageInput
              maxPages={pageCount}
              currentPage={filter.currentPage}
              onPageChange={goPage}
              disabled={false}
            />
          </div>
        </div>
      )}

      {/* prefs modal */}
      {showPrefs && (
        <PrefsModal
          prefs={prefs}
          current={currentPrefKey}
          apply={applyPref}
          save={savePref}
          del={deletePref}
          onClose={() => setShowPrefs(false)}
          newName={newPrefName}
          setNewName={setNewPrefName}
          maxNameLength={20}
        />
      )}
    </div>
  );
}
