/* eslint-disable react/prop-types */
import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Settings as SettingsIcon, RefreshCw } from "lucide-react";
import { UserDataContext } from "../context/UserContext";
import MomentCard from "./MomentCard";
import { useMomentFilters, WNBA_TEAMS } from "../hooks/useMomentFilters";
import { getSeriesFilterLabel } from "../utils/seriesNames";

/* ───── colour helpers ───── */
const colour = {
  common: "text-gray-400",
  fandom: "text-lime-400",
  rare: "text-blue-500",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};
const tierClass = (t) => colour[t] ?? "";

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

/* ───── reusable dropdown ───── */
const Dropdown = ({
  opts,
  value,
  onChange,
  title,
  countFn = () => 0,
  labelFn = null,
  width = "w-40",
  isPlayerDropdown = false,
  nftDetails = [],
  filter = {},
}) => {
  // For player dropdown, show total count without serial filters
  const getCount = (option) => {
    if (
      isPlayerDropdown &&
      Array.isArray(nftDetails) &&
      filter.selectedTiers &&
      filter.selectedSeries
    ) {
      return nftDetails.filter(
        (n) =>
          !n.isLocked &&
          n.fullName === option &&
          filter.selectedTiers.includes((n.tier || "").toLowerCase()) &&
          filter.selectedSeries.includes(Number(n.series))
      ).length;
    }
    return countFn(option);
  };

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={!opts.length}
      title={title}
      className={`${width} bg-brand-primary text-brand-text rounded px-1 py-0.5 disabled:opacity-40 text-base`}
    >
      <option value="All">All</option>
      {opts.map((o) => (
        <option key={o} value={o} className="text-brand-text">
          {labelFn ? labelFn(o) : `${o} (${getCount(o)})`}
        </option>
      ))}
    </select>
  );
};

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
    eligibleMoments,
    base,
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
    <div className="bg-brand-primary text-brand-text p-2 rounded w-full">
      {/* filter panel */}
      <div className="bg-brand-secondary p-2 rounded mb-2">
        {/* filter controls */}
        {/* Series */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs">Series:</span>
            <label className="flex items-center gap-1 text-base">
              <input
                type="checkbox"
                checked={
                  filter.selectedSeries.length &&
                  filter.selectedSeries.length === seriesOptions.length
                }
                onChange={(e) =>
                  setFilter({
                    selectedSeries: e.target.checked ? seriesOptions : [],
                    currentPage: 1,
                  })
                }
              />
              All
            </label>
            {seriesOptions.map((s) => {
              const isAllSelected = filter.selectedSeries.length === seriesOptions.length;
              const isSeriesSelected = filter.selectedSeries.includes(s);
              // When "All" is selected, show individual boxes as unchecked (visual state)
              const visualChecked = isAllSelected ? false : isSeriesSelected;
              
              return (
                <label key={s} className="flex items-center gap-1 text-base">
                  <input
                    type="checkbox"
                    checked={visualChecked}
                    onChange={() => {
                      if (isAllSelected) {
                        // "All" is selected: uncheck "All" and select just this series
                        setFilter({ selectedSeries: [s], currentPage: 1 });
                      } else {
                        // Normal toggle behavior
                        const next = isSeriesSelected
                          ? filter.selectedSeries.filter((x) => x !== s)
                          : [...filter.selectedSeries, s];
                        setFilter({ selectedSeries: next, currentPage: 1 });
                      }
                    }}
                  />
                  {getSeriesFilterLabel(s, 'topshot')}
                </label>
              );
            })}
          </div>
        </div>

        {/* Tiers */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-brand-primary/30">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs">Tiers:</span>
            <label className="flex items-center gap-1 text-base">
              <input
                type="checkbox"
                checked={
                  filter.selectedTiers.length &&
                  filter.selectedTiers.length === tierOptions.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    // Check "All" - select all tiers
                    setFilter({ selectedTiers: tierOptions, currentPage: 1 });
                  } else {
                    // Uncheck "All" - but prevent deselecting all, so select just the first tier
                    if (tierOptions.length > 0) {
                      setFilter({ selectedTiers: [tierOptions[0]], currentPage: 1 });
                    }
                  }
                }}
              />
              All
            </label>
            {tierOptions.map((t) => {
              const isAllSelected = filter.selectedTiers.length === tierOptions.length;
              const isTierSelected = filter.selectedTiers.includes(t);
              // When "All" is selected, show individual boxes as unchecked (visual state)
              const visualChecked = isAllSelected ? false : isTierSelected;
              
              return (
                <label key={t} className="flex items-center gap-1 text-base">
                  <input
                    type="checkbox"
                    checked={visualChecked}
                    onChange={() => {
                      if (isAllSelected) {
                        // "All" is selected: uncheck "All" and select just this tier
                        setFilter({ selectedTiers: [t], currentPage: 1 });
                      } else {
                        // Normal toggle behavior
                        const next = isTierSelected
                          ? filter.selectedTiers.filter((x) => x !== t)
                          : [...filter.selectedTiers, t];
                        // Prevent deselecting all tiers
                        if (next.length === 0) {
                          return; // Don't allow deselecting all
                        }
                        setFilter({ selectedTiers: next, currentPage: 1 });
                      }
                    }}
                  />
                  <span className={tierClass(t)}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </span>
                </label>
              );
            })}
          </div>
          <div className="h-6 w-px bg-brand-primary/30 mx-2"></div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs">Safety Filters:</span>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={filter.excludeSpecialSerials}
                onChange={(e) =>
                  setFilter({ excludeSpecialSerials: e.target.checked })
                }
              />
              <span className="text-xs">Exclude #1 / Jersey / Last Mint</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={filter.excludeLowSerials}
                onChange={(e) =>
                  setFilter({ excludeLowSerials: e.target.checked })
                }
              />
              <span className="text-xs">Exclude serials ≤ 4000</span>
            </label>
          </div>
        </div>

        {/* other filters */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-brand-primary/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs">League:</span>
            <Dropdown
              opts={leagueOptions}
              value={filter.selectedLeague}
              onChange={(e) =>
                setFilter({ selectedLeague: e.target.value, currentPage: 1 })
              }
              title="Filter by league"
              countFn={(league) =>
                eligibleMoments.filter((m) =>
                  league === "All"
                    ? true
                    : league === "WNBA"
                    ? WNBA_TEAMS.includes(m.teamAtMoment || "")
                    : !WNBA_TEAMS.includes(m.teamAtMoment || "")
                ).length
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs">Set:</span>
            <Dropdown
              opts={setNameOptions}
              value={filter.selectedSetName}
              onChange={(e) =>
                setFilter({ selectedSetName: e.target.value, currentPage: 1 })
              }
              title="Filter by set"
              countFn={(set) =>
                eligibleMoments.filter((m) =>
                  set === "All" ? true : m.name === set
                ).length
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs">Team:</span>
            <Dropdown
              opts={teamOptions}
              value={filter.selectedTeam}
              onChange={(e) =>
                setFilter({ selectedTeam: e.target.value, currentPage: 1 })
              }
              title="Filter by team"
              countFn={(team) =>
                eligibleMoments.filter((m) =>
                  team === "All" ? true : m.teamAtMoment === team
                ).length
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs">Player:</span>
            <Dropdown
              opts={playerOptions}
              value={filter.selectedPlayer}
              onChange={(e) =>
                setFilter({ selectedPlayer: e.target.value, currentPage: 1 })
              }
              title="Filter by player"
              countFn={(player) =>
                player === "All"
                  ? base.baseNoPlayer.length
                  : base.baseNoPlayer.filter((m) => m.fullName === player)
                      .length
              }
            />
          </div>
        </div>

        {/* bottom section */}
        <div className="flex flex-col gap-2 pt-2 mt-2 border-t border-brand-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || cooldown}
                title={
                  cooldown
                    ? "Please wait a few seconds before refreshing again"
                    : "Refresh snapshots"
                }
                className="p-1 rounded-full hover:bg-flow-dark/10 disabled:opacity-40 focus-visible:ring focus-visible:ring-flow-dark/60 select-none"
              >
                <RefreshCw
                  size={16}
                  className={`${
                    isRefreshing ? "animate-spin" : ""
                  } text-opolis`}
                />
              </button>
              <span className="text-xs text-brand-text/70">
                Updated: <span className="text-brand-text">{elapsed}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-text/70">
                Filter:{" "}
                <span className="text-brand-text">
                  {currentPrefKey || "None"}
                </span>
              </span>
              <button
                aria-label="Filter settings"
                onClick={() => setShowPrefs(true)}
                className="relative group p-1 rounded-full hover:bg-flow-dark/10 focus-visible:ring focus-visible:ring-flow-dark/60 select-none"
              >
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded bg-flow-dark px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Filter settings
                </span>
                <SettingsIcon
                  size={18}
                  strokeWidth={2.4}
                  className="text-brand-text"
                />
              </button>
              <button
                onClick={() =>
                  setFilter({
                    selectedTiers: tierOptions,
                    selectedSeries: seriesOptions,
                    selectedSetName: "All",
                    selectedLeague: "All",
                    selectedTeam: "All",
                    selectedPlayer: "All",
                    currentPage: 1,
                  })
                }
                className="px-1.5 py-0.5 bg-brand-primary rounded hover:opacity-80 text-xs"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selection limit warning */}
      {selectedNFTs.length >= 200 && (
        <div className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-sm text-yellow-300 text-center">
          Max 200 NFTs selected. Deselect some to add more.
        </div>
      )}

      {/* grid */}
      {pageCount > 1 && (
        <div className="flex justify-between items-center mb-2 text-sm text-brand-text/70">
          <p>
            Showing {pageSlice.length} of{" "}
            {eligibleMoments.length.toLocaleString()} items
          </p>
          <p>
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
        <div className="flex justify-center items-center gap-3 mt-4">
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
