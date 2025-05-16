/* eslint-disable react/prop-types */
import React, { useContext, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { UserDataContext } from "../context/UserContext";
import MomentCard from "./MomentCard";
import { useMomentFilters, WNBA_TEAMS } from "../hooks/useMomentFilters";

/* ─── helpers ──────────────────────────────────────────── */
const colour = {
  common: "text-gray-400",
  fandom: "text-lime-400",
  rare: "text-blue-500",
  legendary: "text-orange-500",
  ultimate: "text-pink-500",
};
const tierClass = (t) => colour[t] ?? "";

const Dropdown = ({ opts, value, onChange, title, countFn }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={!opts.length}
    title={title}
    className="w-36 bg-brand-primary text-brand-text rounded px-1 py-0.5 disabled:opacity-40"
  >
    <option value="All">All</option>
    {opts.map((o) => (
      <option key={o} value={o} className="text-brand-text">
        {`${o} (${countFn(o)})`}
      </option>
    ))}
  </select>
);

/* ─── Preset-modal ────────────────────────────────────── */
const sanitizeName = (str) =>
  str
    .replace(/<\/?[^>]*>/g, "") // strip HTML
    .replace(/[^\w\s\-]/gi, "") // allow A-Z 0-9 _-
    .replace(/\s+/g, " ") // collapse spaces
    .trim()
    .slice(0, 40); // max 40 chars

function PrefsModal({
  prefs,
  current,
  apply,
  save,
  del,
  onClose,
  newName,
  setNewName,
}) {
  const [err, setErr] = useState("");
  const trySave = () => {
    const clean = sanitizeName(newName);
    if (!clean) return setErr("Name required");
    if (Object.keys(prefs).some((k) => k.toLowerCase() === clean.toLowerCase()))
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

/* ─── Main component ──────────────────────────────────── */
export default function MomentSelection(props) {
  const {
    user,
    accountData,
    selectedNFTs,
    dispatch: appDispatch,
    isRefreshing,
    selectedAccount,
    selectedAccountType,
  } = useContext(UserDataContext);

  /* pick NFT list for parent vs child */
  const nftDetails =
    selectedAccountType === "parent"
      ? accountData?.nftDetails || []
      : accountData?.childrenData?.find((c) => c.addr === selectedAccount)
          ?.nftDetails || [];

  const hasCollection =
    selectedAccountType === "parent"
      ? accountData?.hasCollection ?? false
      : accountData?.childrenData?.find((c) => c.addr === selectedAccount)
          ?.hasCollection ?? false;

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
  } = useMomentFilters({ ...props, nftDetails, selectedNFTs });

  /* ── pagination helpers ─────────────────────────────── */
  const PER_PAGE = 30;
  const pageCount = Math.ceil(eligibleMoments.length / PER_PAGE);
  const pageSlice = eligibleMoments.slice(
    (filter.currentPage - 1) * PER_PAGE,
    filter.currentPage * PER_PAGE
  );
  const goPage = (p) => {
    setFilter({ currentPage: p });
  };

  /* modal state */
  const [showPrefs, setShowPrefs] = useState(false);
  const [newPrefName, setNewPrefName] = useState("");

  /* early exits */
  if (!user?.loggedIn)
    return <p className="text-brand-text/70 px-2">Please log in.</p>;
  if (!hasCollection)
    return (
      <div className="bg-brand-primary p-2 rounded-lg">
        <p className="text-brand-text/80 text-sm">
          This account does not have a Top Shot collection.
        </p>
      </div>
    );

  /* ── render ─────────────────────────────────────────── */
  return (
    <div className="w-full bg-brand-primary text-brand-text rounded-lg">
      {/* header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 px-2 pt-2">
        {/* counts */}
        <div className="flex-1">
          {filter.selectedSeries.length === 0 ? (
            <p className="text-brand-text/70 font-semibold">
              Please select at least one Series to view available Moments.
            </p>
          ) : eligibleMoments.length === 0 ? (
            <p className="text-brand-text/70">No Moments match your filters.</p>
          ) : (
            <p className="text-brand-text/70">
              {eligibleMoments.length} Moments match your filters.
            </p>
          )}
          <p className="text-xs text-brand-text/60 mt-1">
            Note: Only unlocked Common and Fandom are eligible to be swapped for
            TSHOT.
          </p>
        </div>

        {/* cog + badge */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Filter settings"
            onClick={() => setShowPrefs(true)}
            className="
              relative group
              p-2                       /* 44×44 tap area */
              rounded-full
              hover:bg-flow-dark/10
              focus-visible:ring focus-visible:ring-flow-dark/60
              transition-colors duration-150
            "
          >
            {/* tooltip */}
            <span
              className="
                pointer-events-none
                absolute -top-9 left-1/2 -translate-x-1/2
                rounded bg-flow-dark px-2 py-1 text-xs text-white
                opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
                transition-opacity duration-150
              "
            >
              Filter settings
            </span>
            <SettingsIcon
              size={32}
              strokeWidth={2.4}
              className="text-brand-text"
            />
          </button>

          <span className="text-xs text-brand-text/60 whitespace-nowrap sm:whitespace-normal">
            Filter:&nbsp;
            {currentPrefKey ? (
              <span className="text-brand-text">{currentPrefKey}</span>
            ) : (
              "None"
            )}
          </span>

          {isRefreshing && (
            <span className="text-brand-text/70 ml-2">
              <span className="animate-spin inline-block mr-1">⟳</span>
              Loading…
            </span>
          )}
        </div>
      </header>

      {/* ── filter panel (unchanged logic) ──────────────── */}
      {seriesOptions.length > 0 && (
        <section className="flex flex-col gap-4 bg-brand-secondary p-4 rounded mb-2 mx-2">
          {/* tiers + series */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {/* tiers */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Tiers:</span>
              {tierOptions.map((t) => (
                <label key={t} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={filter.selectedTiers.includes(t)}
                    onChange={() => {
                      const next = filter.selectedTiers.includes(t)
                        ? filter.selectedTiers.filter((x) => x !== t)
                        : [...filter.selectedTiers, t];
                      setFilter({ selectedTiers: next, currentPage: 1 });
                    }}
                  />
                  <span className={tierClass(t)}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </span>
                </label>
              ))}
            </div>

            {/* series */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Series:</span>
              <label className="flex items-center gap-1">
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
              {seriesOptions.map((s) => (
                <label key={s} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={filter.selectedSeries.includes(s)}
                    onChange={() => {
                      const next = filter.selectedSeries.includes(s)
                        ? filter.selectedSeries.filter((x) => x !== s)
                        : [...filter.selectedSeries, s];
                      setFilter({ selectedSeries: next, currentPage: 1 });
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* dropdowns */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {/* league */}
            <div className="flex items-center gap-1">
              <span className="font-semibold">League:</span>
              <Dropdown
                opts={leagueOptions}
                value={filter.selectedLeague}
                onChange={(e) =>
                  setFilter({
                    selectedLeague: e.target.value,
                    selectedSetName: "All",
                    selectedTeam: "All",
                    selectedPlayer: "All",
                    currentPage: 1,
                  })
                }
                title="Select a league"
                countFn={(o) =>
                  base.baseNoLeague.filter(
                    (m) =>
                      (WNBA_TEAMS.includes(m.teamAtMoment || "")
                        ? "WNBA"
                        : "NBA") === o
                  ).length
                }
              />
            </div>

            {/* set */}
            <div className="flex items-center gap-1">
              <span className="font-semibold">Set:</span>
              <Dropdown
                opts={setNameOptions}
                value={filter.selectedSetName}
                onChange={(e) =>
                  setFilter({
                    selectedSetName: e.target.value,
                    selectedTeam: "All",
                    selectedPlayer: "All",
                    currentPage: 1,
                  })
                }
                title="Select a set"
                countFn={(o) =>
                  base.baseNoSet.filter((m) => m.name === o).length
                }
              />
            </div>

            {/* team */}
            <div className="flex items-center gap-1">
              <span className="font-semibold">Team:</span>
              <Dropdown
                opts={teamOptions}
                value={filter.selectedTeam}
                onChange={(e) =>
                  setFilter({
                    selectedTeam: e.target.value,
                    selectedPlayer: "All",
                    currentPage: 1,
                  })
                }
                title="Select a team"
                countFn={(o) =>
                  base.baseNoTeam.filter((m) => m.teamAtMoment === o).length
                }
              />
            </div>

            {/* player */}
            <div className="flex items-center gap-1">
              <span className="font-semibold">Player:</span>
              <Dropdown
                opts={playerOptions}
                value={filter.selectedPlayer}
                onChange={(e) =>
                  setFilter({ selectedPlayer: e.target.value, currentPage: 1 })
                }
                title="Select a player"
                countFn={(o) =>
                  base.baseNoPlayer.filter((m) => m.fullName === o).length
                }
              />
            </div>
          </div>

          {/* serial + reset */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={filter.excludeSpecialSerials}
                onChange={(e) =>
                  setFilter({ excludeSpecialSerials: e.target.checked })
                }
              />
              Exclude #1 / last / jersey
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={filter.excludeLowSerials}
                onChange={(e) =>
                  setFilter({ excludeLowSerials: e.target.checked })
                }
              />
              Exclude serials ≤ 4000
            </label>

            <button
              onClick={() =>
                setFilter({
                  selectedTiers: tierOptions,
                  selectedSeries: seriesOptions,
                  selectedSetName: "All",
                  selectedLeague: "All",
                  selectedTeam: "All",
                  selectedPlayer: "All",
                  excludeSpecialSerials: true,
                  excludeLowSerials: true,
                  currentPage: 1,
                })
              }
              className="ml-auto px-2 py-1 bg-brand-primary rounded hover:opacity-80 text-sm"
            >
              Reset All
            </button>
          </div>
        </section>
      )}

      {/* grid */}
      {pageSlice.length ? (
        <div className="flex flex-wrap gap-2 mt-2 px-2 pb-2">
          {pageSlice.map((n) => (
            <MomentCard
              key={n.id}
              nft={n}
              handleNFTSelection={(id) =>
                appDispatch({ type: "SET_SELECTED_NFTS", payload: id })
              }
              isSelected={selectedNFTs.includes(n.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-brand-text/70 mt-4 text-sm px-2 pb-2">
          {filter.selectedSeries.length === 0
            ? "Please select at least one Series to view available Moments."
            : "No moments match your filters. Try adjusting them."}
        </p>
      )}

      {/* pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-4">
          {(() => {
            const pages = [];
            if (pageCount <= 7) {
              // If 7 or fewer pages, show all
              for (let i = 1; i <= pageCount; i++) pages.push(i);
            } else if (filter.currentPage <= 4) {
              // If current page is near start, show first 5 + ... + last
              pages.push(1, 2, 3, 4, 5, "...", pageCount);
            } else if (filter.currentPage > pageCount - 4) {
              // If current page is near end, show first + ... + last 5
              pages.push(
                1,
                "...",
                pageCount - 4,
                pageCount - 3,
                pageCount - 2,
                pageCount - 1,
                pageCount
              );
            } else {
              // If current page is in middle, show first + ... + current-1, current, current+1 + ... + last
              pages.push(
                1,
                "...",
                filter.currentPage - 1,
                filter.currentPage,
                filter.currentPage + 1,
                "...",
                pageCount
              );
            }
            return pages.map((p, idx) => (
              <button
                key={`page-${idx}`}
                onClick={() => p !== "..." && goPage(Number(p))}
                className={`
                  px-3 py-1 mx-1 rounded
                  ${
                    p === filter.currentPage
                      ? "bg-flow-dark text-white"
                      : "bg-brand-secondary text-brand-text/80"
                  }
                  ${p === "..." ? "pointer-events-none" : "hover:opacity-80"}
                `}
              >
                {p}
              </button>
            ));
          })()}
        </div>
      )}

      {/* modal */}
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
        />
      )}
    </div>
  );
}
