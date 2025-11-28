import React, { useEffect, useMemo, useState } from "react";
import * as fcl from "@onflow/fcl";
import AllDayMomentCard from "./AllDayMomentCard";
import MomentCardSkeleton from "./MomentCardSkeleton";
import PageInput from "./PageInput";
import { getAllDayCollectionBatched } from "../flow/getAllDayCollectionBatched";
import { useAllDayContext } from "../context/AllDayContext";

// Reuse the same treasury/offer owner address as used on Grail Bounties
const TREASURY_ADDRESS = "0xd69b6ce48815d4ad";
const PAGE_SIZE = 48;

function AllDayGrailsVault() {
  const { allDayMetadataCache, fetchAllDayTreasury } = useAllDayContext();
  const [localMeta, setLocalMeta] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loadingMeta, setLoadingMeta] = useState(false); // reserved for potential loading indicators
  const [momentIds, setMomentIds] = useState([]);
  const [loadingIds, setLoadingIds] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const maxPages = useMemo(() => Math.max(1, Math.ceil(momentIds.length / PAGE_SIZE)), [momentIds.length]);

  const [detailsCache, setDetailsCache] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Ensure metadata is available locally if the shared cache is empty
  useEffect(() => {
    const hasSharedMeta = allDayMetadataCache && Object.keys(allDayMetadataCache).length > 0;
    if (hasSharedMeta || localMeta) return;
    setLoadingMeta(true);
    (async () => {
      try {
        const res = await fetch("https://api.vaultopolis.com/allday-data");
        if (!res.ok) throw new Error(`Meta fetch failed: ${res.status}`);
        const arr = await res.json();
        const map = arr.reduce((m, r) => {
          m[r.editionID] = {
            tier: r.tier,
            playerName: r.FullName,
            teamName: r.TeamAtMoment,
            series: r.seriesID,
            setName: r.name,
            maxMintSize: r.maxMintSize,
            numMinted: r.numMinted,
            parallel: r.parallel,
          };
          return m;
        }, {});
        setLocalMeta(map);
      } catch (e) {
        setLocalMeta({});
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, [allDayMetadataCache, localMeta]);

  useEffect(() => {
    (async () => {
      setLoadingIds(true);
      setError("");
      try {
        const ids = await fetchAllDayTreasury();
        setMomentIds(ids);
      } catch (e) {
        setError(e?.message || String(e));
        setMomentIds([]);
      } finally {
        setLoadingIds(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageIds = useMemo(() => {
    if (!Array.isArray(momentIds) || momentIds.length === 0) return [];
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return momentIds.slice(start, end);
  }, [momentIds, page]);

  useEffect(() => {
    if (!pageIds.length) return;
    const idsNeedingFetch = pageIds.filter((id) => !detailsCache[id]);
    if (idsNeedingFetch.length === 0) return;
    (async () => {
      setLoadingDetails(true);
      try {
        const details = await fcl.query({
          cadence: getAllDayCollectionBatched,
          args: (arg, t) => [arg(TREASURY_ADDRESS, t.Address), arg(idsNeedingFetch.map((n) => String(n)), t.Array(t.UInt64))],
        });
        const map = {};
        if (Array.isArray(details)) {
          for (const d of details) {
            if (!d || d.id === undefined) continue;
            map[Number(d.id)] = {
              id: Number(d.id),
              editionID: Number(d.editionID),
              setID: Number(d.setID),
              playID: Number(d.playID),
              seriesID: Number(d.seriesID),
              serialNumber: Number(d.serialNumber),
              tier: d.tier,
            };
          }
        }
        setDetailsCache((prev) => ({ ...prev, ...map }));
      } catch (e) {
        // Soft-fail details fetching, show what we can
      } finally {
        setLoadingDetails(false);
      }
    })();
  }, [pageIds, detailsCache]);

  const items = useMemo(() => {
    const metaSource = (allDayMetadataCache && Object.keys(allDayMetadataCache).length > 0)
      ? allDayMetadataCache
      : (localMeta || {});
    const mapped = pageIds.map((id) => {
      const base = detailsCache[id] || { id };
      const editionId = base?.editionID;
      const meta = editionId ? metaSource[editionId] : null;
      if (!meta) return base;
      return {
        ...base,
        tier: meta.tier ?? base.tier,
        playerName: meta.playerName ?? base.playerName,
        setName: meta.setName ?? base.setName,
        series: meta.series ?? base.series,
        teamName: meta.teamName ?? base.teamName,
        maxMintSize: meta.maxMintSize ?? base.maxMintSize,
      };
    });
    // Sort by serial number (lowest first)
    return mapped.sort((a, b) => {
      const serialA = a.serialNumber || 999999;
      const serialB = b.serialNumber || 999999;
      return serialA - serialB;
    });
  }, [pageIds, detailsCache, allDayMetadataCache, localMeta]);

  return (
    <div className="text-brand-text w-full">
      <div className="w-full">
          {error && (
            <p className="text-sm text-red-400 mb-2">{error}</p>
          )}
          {/* Top pagination - "Showing X of Y" on same row as controls */}
          {maxPages > 1 && (
            <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mb-4">
              {/* "Showing X of Y items" text - hide "Showing" on mobile */}
              {momentIds.length > 0 && (
                <p className="text-sm text-brand-text/70 whitespace-nowrap">
                  <span className="hidden sm:inline">Showing </span>
                  {items.length > 0 ? items.length : PAGE_SIZE} of {momentIds.length.toLocaleString()}<span className="hidden sm:inline"> items</span>
                </p>
              )}
              
              {/* Mobile: Simple Prev/Next with compact indicator */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loadingIds || loadingDetails}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Prev
                </button>
                <span className="text-xs text-brand-text/70 px-2">
                  {page}/{maxPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(maxPages, p + 1))}
                  disabled={page === maxPages || loadingIds || loadingDetails}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Next
                </button>
              </div>

              {/* Desktop: Full pagination with PageInput */}
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loadingIds || loadingDetails}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                    Page {page} of {maxPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(maxPages, p + 1))}
                    disabled={page === maxPages || loadingIds || loadingDetails}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="h-[1px] w-8 bg-brand-primary/30" />
                <PageInput
                  maxPages={maxPages}
                  currentPage={page}
                  onPageChange={setPage}
                  disabled={loadingIds || loadingDetails}
                />
              </div>
            </div>
          )}

          {/* Show skeletons during loading */}
          {(loadingIds || loadingDetails) && items.length === 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
              {[...Array(20)].map((_, i) => (
                <MomentCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : !loadingIds && momentIds.length === 0 && !error ? (
            <div className="text-center py-8">
              <p className="text-sm text-brand-text/70 mb-2">No moments acquired yet through Grail Bounties.</p>
              <p className="text-xs text-brand-text/50">Moments will appear here once they are acquired by the program.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
              {items.map((nft) => (
                <AllDayMomentCard key={nft.id} nft={nft} disableHover />
              ))}
            </div>
          )}

          {/* Bottom pagination - "Showing X of Y" on same row as controls */}
          {maxPages > 1 && (
            <div className="flex flex-row justify-between items-center gap-2 sm:gap-3 mt-4">
              {/* "Showing X of Y items" text - hide "Showing" on mobile */}
              {momentIds.length > 0 && (
                <p className="text-sm text-brand-text/70 whitespace-nowrap">
                  <span className="hidden sm:inline">Showing </span>
                  {items.length > 0 ? items.length : PAGE_SIZE} of {momentIds.length.toLocaleString()}<span className="hidden sm:inline"> items</span>
                </p>
              )}
              
              {/* Mobile: Simple Prev/Next with compact indicator */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loadingIds || loadingDetails}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Prev
                </button>
                <span className="text-xs text-brand-text/70 px-2">
                  {page}/{maxPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(maxPages, p + 1))}
                  disabled={page === maxPages || loadingIds || loadingDetails}
                  className="px-3 py-1.5 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50 text-sm font-medium"
                >
                  Next
                </button>
              </div>

              {/* Desktop: Full pagination with PageInput */}
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loadingIds || loadingDetails}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-brand-text/70 min-w-[100px] text-center">
                    Page {page} of {maxPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(maxPages, p + 1))}
                    disabled={page === maxPages || loadingIds || loadingDetails}
                    className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="h-[1px] w-8 bg-brand-primary/30" />
                <PageInput
                  maxPages={maxPages}
                  currentPage={page}
                  onPageChange={setPage}
                  disabled={loadingIds || loadingDetails}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default AllDayGrailsVault;


