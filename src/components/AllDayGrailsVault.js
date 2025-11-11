import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import AllDayMomentCard from "./AllDayMomentCard";
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
    <div className="text-brand-text">
      <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden">
        <div className="p-4 border-b border-brand-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl" aria-hidden="true">🏈</span>
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold m-0">AllDay Grail Bounties Vault</h2>
                  <p className="text-xs sm:text-sm text-brand-text/70 m-0">
                    Treasury-held NFL AllDay Moments
                    {loadingIds ? " (Loading…)" : ` (${momentIds.length.toLocaleString()} total)`}
                  </p>
                </div>
                <Link 
                  to="/bounties/allday" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-brand-accent/90 transition-all shadow-sm hover:shadow-md"
                >
                  💰 View Grail Bounties
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3">
          {error && (
            <p className="text-sm text-red-400 mb-2">{error}</p>
          )}
          {!loadingIds && momentIds.length === 0 && !error && (
            <p className="text-sm text-brand-text/70">No moments found for the treasury.</p>
          )}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-1.5 justify-items-center">
            {items.map((nft) => (
              <AllDayMomentCard key={nft.id} nft={nft} disableHover />
            ))}
          </div>

          {maxPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-3 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loadingIds || loadingDetails}
                className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-brand-text/70 min-w-[100px] text-center">Page {page} of {maxPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(maxPages, p + 1))}
                disabled={page === maxPages || loadingIds || loadingDetails}
                className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllDayGrailsVault;


