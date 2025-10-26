import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import * as fcl from "@onflow/fcl";
import MomentCard from "./MomentCard";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import { getTopShotCollectionBatched } from "../flow/getTopShotCollectionBatched";
import { UserDataContext } from "../context/UserContext";

// Reuse the same treasury/offer owner address as used on Grail Bounties
const TREASURY_ADDRESS = "0xd69b6ce48815d4ad";
const PAGE_SIZE = 48;

function GrailBountiesVault() {
  const { metadataCache } = useContext(UserDataContext);
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
    const hasSharedMeta = metadataCache && Object.keys(metadataCache).length > 0;
    if (hasSharedMeta || localMeta) return;
    setLoadingMeta(true);
    (async () => {
      try {
        const res = await fetch("https://api.vaultopolis.com/topshot-data");
        if (!res.ok) throw new Error(`Meta fetch failed: ${res.status}`);
        const arr = await res.json();
        const map = arr.reduce((m, r) => {
          m[`${r.setID}-${r.playID}`] = {
            tier: r.tier,
            FullName: r.FullName,
            JerseyNumber: r.JerseyNumber,
            momentCount: r.momentCount,
            TeamAtMoment: r.TeamAtMoment,
            name: r.name,
            series: r.series,
          };
          return m;
        }, {});
        setLocalMeta(map);
      } catch (e) {
        // Non-fatal; cards will show partial data if meta unavailable
        setLocalMeta({});
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, [metadataCache, localMeta]);

  useEffect(() => {
    (async () => {
      setLoadingIds(true);
      setError("");
      try {
        const ids = await fcl.query({
          cadence: getTopShotCollectionIDs,
          args: (arg, t) => [arg(TREASURY_ADDRESS, t.Address)],
        });
        const normalized = Array.isArray(ids) ? ids.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];
        setMomentIds(normalized);
      } catch (e) {
        setError(e?.message || String(e));
        setMomentIds([]);
      } finally {
        setLoadingIds(false);
      }
    })();
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
        // Fetch details for the current page in one batched script call
        const details = await fcl.query({
          cadence: getTopShotCollectionBatched,
          args: (arg, t) => [arg(TREASURY_ADDRESS, t.Address), arg(idsNeedingFetch.map((n) => String(n)), t.Array(t.UInt64))],
        });
        const map = {};
        if (Array.isArray(details)) {
          for (const d of details) {
            if (!d || d.id === undefined) continue;
            map[Number(d.id)] = {
              id: Number(d.id),
              setID: Number(d.setID),
              playID: Number(d.playID),
              serialNumber: Number(d.serialNumber),
              isLocked: Boolean(d.isLocked),
              subeditionID: d.subeditionID === null || d.subeditionID === undefined ? null : Number(d.subeditionID),
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
    const metaSource = (metadataCache && Object.keys(metadataCache).length > 0)
      ? metadataCache
      : (localMeta || {});
    const mapped = pageIds.map((id) => {
      const base = detailsCache[id] || { id };
      const setId = base?.setID;
      const playId = base?.playID;
      const metaKey = (setId != null && playId != null) ? `${setId}-${playId}` : null;
      const meta = metaKey ? metaSource[metaKey] : null;
      if (!meta) return base;
      return {
        ...base,
        tier: meta.tier ?? base.tier,
        fullName: meta.FullName ?? base.fullName,
        name: meta.name ?? base.name,
        series: meta.series ?? base.series,
        teamAtMoment: meta.TeamAtMoment ?? base.teamAtMoment,
        momentCount: meta.momentCount ?? base.momentCount,
      };
    });
    // Sort by serial number (lowest first)
    return mapped.sort((a, b) => {
      const serialA = a.serialNumber || 999999;
      const serialB = b.serialNumber || 999999;
      return serialA - serialB;
    });
  }, [pageIds, detailsCache, metadataCache, localMeta]);

  return (
    <div className="text-brand-text">
      <div className="bg-brand-primary rounded-lg border border-brand-border overflow-hidden">
        <div className="p-4 border-b border-brand-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl" aria-hidden="true">🏛️</span>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold m-0">Grail Bounties Vault</h2>
                <p className="text-xs sm:text-sm text-brand-text/70 m-0">
                  Treasury-held NBA Top Shot Moments
                  {loadingIds ? " (Loading…)" : ` (${momentIds.length.toLocaleString()} total)`}
                </p>
              </div>
            </div>
            <Link 
              to="/bounties/topshot" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white text-base font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              💰 View Grail Bounties
            </Link>
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
              <MomentCard key={nft.id} nft={nft} disableHover />
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

export default GrailBountiesVault;


