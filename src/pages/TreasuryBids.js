// Migrate implementation from Offers.js: import and re-export default
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import * as fcl from "@onflow/fcl";
import TransactionModal from "../components/TransactionModal";
import useTransaction from "../hooks/useTransaction";
import { acceptTopShotOffer } from "../flow/offers/acceptTopShotOffer";
import { acceptTopShotOffer_child } from "../flow/offers/acceptTopShotOffer_child";
import { getAllOfferDetails } from "../flow/offers/getAllOfferDetails";
import { getFLOWBalance } from "../flow/getFLOWBalance";
import AccountSelection from "../components/AccountSelection";
import MomentCard, { tierStyles } from "../components/MomentCard";
import { convertFlowToUSD, convertFlowToUSDSync, formatUSD, getFlowPrice } from "../utils/flowPrice";

export default function TreasuryBids() {
  const {
    accountData,
    selectedAccount,
    selectedAccountType,
    dispatch,
    metadataCache,
    smartRefreshUserData,
  } = React.useContext(UserDataContext);
  const OFFER_OWNER_ADDRESS = "0xd69b6ce48815d4ad";
  const [loading, setLoading] = useState(false);
  const isFetchingOffersRef = useRef(false);
  const sealedHandledRef = useRef(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  const [txModal, setTxModal] = useState({ open: false, status: null, txId: null, context: null });
  const { sendTransaction, status: txStatus, txId } = useTransaction();
  const [matchesPage, setMatchesPage] = useState(1);
  const [usdAmounts, setUsdAmounts] = useState({});
  const [treasuryBalance, setTreasuryBalance] = useState(0);
  const [flowPrice, setFlowPrice] = useState(null);
  const MATCHES_PER_PAGE = 24;

  const EditionOfferCard = ({ offer }) => {
    const setId = offer.__setId;
    const playId = offer.__playId;
    const metaKey = setId && playId ? `${setId}-${playId}` : null;
    const meta = metaKey && metadataCache ? metadataCache[metaKey] : null;
    const player = meta?.FullName || meta?.name || "Unknown Player";
    const setName = meta?.name || "Unknown Set";
    const series = meta?.series !== undefined ? String(meta.series) : "?";
    const tier = meta?.tier || "";
    const totalMinted = meta?.momentCount || meta?.subeditionMaxMint || "?";

    const editionKey = `${setId}_${playId}`;
    const imageUrl = `https://storage.googleapis.com/flowconnect/topshot/images_small/${editionKey}.jpg`;

    const tierClass = tier ? tierStyles[tier.toLowerCase()] || "text-gray-400" : "text-gray-400";

    const [isPlayerNameWrapped, setIsPlayerNameWrapped] = useState(false);
    const [isSetNameWrapped, setIsSetNameWrapped] = useState(false);
    const playerNameRef = useRef(null);
    const setNameRef = useRef(null);

    useLayoutEffect(() => {
      if (playerNameRef.current) {
        const isOverflowing = playerNameRef.current.scrollHeight > playerNameRef.current.clientHeight;
        setIsPlayerNameWrapped(isOverflowing);
      }
    }, [player]);

    useLayoutEffect(() => {
      if (setNameRef.current) {
        const isOverflowing = setNameRef.current.scrollHeight > setNameRef.current.clientHeight;
        setIsSetNameWrapped(isOverflowing);
      }
    }, [setName]);

    return (
      <div className="flex flex-col items-center">
        <div
          className="w-[140px] sm:w-40 rounded overflow-hidden flex flex-col pt-2 px-1 border border-brand-text/40 bg-black text-brand-text select-none"
          style={{ height: '320px' }}
        >
          <div className="relative overflow-hidden rounded mx-auto mb-2 flex-shrink-0 p-1" style={{ height: '150px', width: '100%' }}>
            <img
              src={imageUrl}
              alt={`${player} moment`}
              loading="lazy"
              decoding="async"
              className="object-cover w-full h-full transform scale-[1.4]"
              style={{ objectPosition: "center 20%" }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 w-full h-full bg-gray-700 items-center justify-center">
              <div className="text-gray-400 text-xs text-center">No Image</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between pb-1">
            <div>
              <h3
                ref={playerNameRef}
                className={`text-center font-semibold leading-tight h-[24px] sm:h-[28px] flex items-center justify-center ${
                  isPlayerNameWrapped ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'
                }`}
              >
                {player}
              </h3>
              <p className="text-center text-[10px] sm:text-xs text-brand-text/60 leading-tight h-[12px] sm:h-[14px] flex items-center justify-center">
                Series {series}
              </p>
              <p className={`text-center text-[10px] sm:text-xs truncate leading-tight ${tierClass} h-[12px] sm:h-[14px] flex items-center justify-center`}>
                {tier ? tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase() : ""}
              </p>
              <p
                ref={setNameRef}
                className={`text-center text-brand-text/50 leading-tight min-h-[24px] sm:min-h-[28px] flex items-center justify-center ${
                  isSetNameWrapped ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'
                }`}
              >
                {setName}
              </p>
              <p className="text-center text-[10px] sm:text-xs text-brand-text/50 truncate leading-tight h-[12px] sm:h-[14px] flex items-center justify-center">
                /{totalMinted}
              </p>
            </div>
            <div>
              <p className="text-center text-[10px] sm:text-xs font-semibold text-green-400 truncate leading-tight mb-0 mt-1">
                {parseFloat(offer.offerAmount).toFixed(2)} {String(offer.currency || 'FLOW').toUpperCase()}
              </p>
              {usdAmounts[offer.offerId] && (
                <p className="text-center text-[10px] sm:text-xs font-semibold text-green-400 truncate leading-tight mb-0">
                  ~{formatUSD(usdAmounts[offer.offerId])} USD
                </p>
              )}
              <p 
                className="text-center text-[8px] sm:text[9px] text-brand-text/40 truncate leading-tight mb-0 mt-1 cursor-pointer hover:text-brand-text/60 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(offer.offerId);
                }}
                title="Click to copy Offer ID"
              >
                ID: {offer.offerId}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const displayedOffers = useMemo(() => {
    return (offers || []).map((o) => {
      let setId = o.setIdParam ?? o.setId ?? "";
      let playId = o.playIdParam ?? o.playId ?? "";
      let resolver = o.resolverParam ?? o.resolver ?? "";
      if ((!setId || !playId || !resolver)) {
        if (typeof o.offerParamsString === "string" && o.offerParamsString.includes("{")) {
          try {
            const params = JSON.parse(o.offerParamsString);
            if (!setId && params.setId) setId = String(params.setId);
            if (!playId && params.playId) playId = String(params.playId);
            if (!resolver && params.resolver) resolver = String(params.resolver);
          } catch {}
        }
        if (o.offerParamsString && typeof o.offerParamsString === "object") {
          try {
            if (!setId && o.offerParamsString.setId) setId = String(o.offerParamsString.setId);
            if (!playId && o.offerParamsString.playId) playId = String(o.offerParamsString.playId);
            if (!resolver && o.offerParamsString.resolver) resolver = String(o.offerParamsString.resolver);
          } catch {}
        }
      }
      const editionKey = setId && playId ? `${setId}_${playId}` : "";
      return {
        ...o,
        __setId: setId,
        __playId: playId,
        __resolver: resolver,
        __editionKey: editionKey,
      };
    }).sort((a, b) => {
      const amountA = parseFloat(a.offerAmount || 0);
      const amountB = parseFloat(b.offerAmount || 0);
      return amountB - amountA;
    });
  }, [offers]);

  const activeAccountData = useMemo(() => {
    if (selectedAccountType === "child") {
      return accountData.childrenData?.find((c) => c.addr === selectedAccount) || accountData;
    }
    return accountData;
  }, [accountData, selectedAccount, selectedAccountType]);

  const userHasCollection = useMemo(
    () => Array.isArray(activeAccountData?.nftDetails) && activeAccountData.nftDetails.length > 0,
    [activeAccountData?.nftDetails]
  );

  const matchingMoments = useMemo(() => {
    if (!userHasCollection || !displayedOffers.length) return [];
    const matches = [];
    const offerMap = new Map();
    displayedOffers.forEach(offer => {
      if (offer.__editionKey) offerMap.set(offer.__editionKey, offer);
    });
    activeAccountData.nftDetails.forEach(moment => {
      const editionKey = `${moment.setID}_${moment.playID}`;
      if (offerMap.has(editionKey)) {
        matches.push({ moment, offer: offerMap.get(editionKey) });
      }
    });
    return matches;
  }, [userHasCollection, displayedOffers, activeAccountData?.nftDetails]);

  const sortedMatches = useMemo(() => {
    if (!Array.isArray(matchingMoments)) return [];
    const copy = [...matchingMoments];
    copy.sort((a, b) => (Number(b.moment?.serialNumber) || 0) - (Number(a.moment?.serialNumber) || 0));
    return copy;
  }, [matchingMoments]);

  useEffect(() => {
    setMatchesPage(1);
  }, [selectedAccount, selectedAccountType, activeAccountData?.parentAddress, displayedOffers.length]);


  const matchCounts = useMemo(() => {
    try {
      const counts = {};
      const lower = (a) => (typeof a === "string" ? a.toLowerCase() : a);
      if (!accountData) return counts;
      const offerKeySet = new Set(
        (displayedOffers || [])
          .map((o) => o?.__editionKey)
          .filter((k) => typeof k === "string" && k.length > 0)
      );
      const countFor = (acct) => {
        const moments = acct?.nftDetails;
        if (!Array.isArray(moments) || moments.length === 0) return 0;
        let c = 0;
        for (const m of moments) {
          const key = `${m?.setID}_${m?.playID}`;
          if (offerKeySet.has(key)) c++;
        }
        return c;
      };
      const parentAddr = lower(accountData?.parentAddress || accountData?.addr);
      if (parentAddr) counts[parentAddr] = countFor(accountData);
      if (Array.isArray(accountData?.childrenData)) {
        for (const child of accountData.childrenData) {
          const addr = lower(child?.addr);
          if (addr) counts[addr] = countFor(child);
        }
      } else if (Array.isArray(accountData?.childrenAddresses)) {
        for (const addrRaw of accountData.childrenAddresses) {
          const addr = lower(addrRaw);
          if (addr && !(addr in counts)) counts[addr] = 0;
        }
      }
      return counts;
    } catch {
      return {};
    }
  }, [accountData, displayedOffers]);

  const paginatedMatches = useMemo(() => {
    const start = (matchesPage - 1) * MATCHES_PER_PAGE;
    const end = start + MATCHES_PER_PAGE;
    return sortedMatches.slice(start, end);
  }, [sortedMatches, matchesPage]);

  const matchesPageCount = useMemo(
    () => Math.max(1, Math.ceil(sortedMatches.length / MATCHES_PER_PAGE)),
    [sortedMatches.length]
  );

  const onAcceptOffer = async (match) => {
    try {
      const buyer = OFFER_OWNER_ADDRESS;
      const offerId = String(match.offer.offerId);
      const momentId = String(match.moment.id);
      const isChild = selectedAccountType === "child" && selectedAccount;
      setTxModal({
        open: true,
        status: "Awaiting Approval",
        txId: null,
        context: {
          swapType: "OFFERS_ACCEPT",
          message: `Accepting offer for Moment #${momentId} (Set ${match.moment.setID}, Play ${match.moment.playID})`,
          amount: parseFloat(match.offer.offerAmount).toFixed(2),
          moment: match.moment,
          offer: match.offer,
        },
      });
      if (isChild) {
        await sendTransaction({
          cadence: acceptTopShotOffer_child,
          args: (arg, t) => [
            arg(selectedAccount, t.Address),
            arg(buyer, t.Address),
            arg(offerId, t.UInt64),
            arg(momentId, t.UInt64),
          ],
        });
      } else {
        await sendTransaction({
          cadence: acceptTopShotOffer,
          args: (arg, t) => [
            arg(buyer, t.Address),
            arg(offerId, t.UInt64),
            arg(momentId, t.UInt64),
          ],
        });
      }
    } catch (e) {
      setTxModal((s) => ({ ...s, status: "Error" }));
    }
  };

  useEffect(() => {
    if (!txModal.open) return;
    if (txStatus) setTxModal((s) => ({ ...s, status: txStatus }));
  }, [txStatus, txModal.open]);

  const fetchUsdAmounts = async (offerList) => {
    const newUsdAmounts = {};
    for (const offer of offerList) {
      try {
        const usdAmount = await convertFlowToUSD(offer.offerAmount);
        if (usdAmount !== null) newUsdAmounts[offer.offerId] = usdAmount;
      } catch {}
    }
    setUsdAmounts((prev) => ({ ...prev, ...newUsdAmounts }));
  };

  const fetchOffers = React.useCallback(async () => {
    if (isFetchingOffersRef.current) return;
    isFetchingOffersRef.current = true;
    setLoading(true);
    setError("");
    try {
      const raw = await fcl.query({
        cadence: getAllOfferDetails,
        args: (arg, t) => [arg(OFFER_OWNER_ADDRESS, t.Address)],
      });
      let normalized = [];
      if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "object") {
        normalized = raw.map((d) => ({
          offerId: d.offerId ?? d.id ?? "",
          purchased: d.purchased ?? "false",
          offerAmount: d.offerAmount ?? d.amount ?? "0.0",
          currency: d.currency ?? "FLOW",
          setIdParam: d.setIdParam ?? d.setId ?? "",
          playIdParam: d.playIdParam ?? d.playId ?? "",
          nftType: d.nftType ?? "",
          resolverParam: d.resolverParam ?? d.resolver ?? "",
          offerParamsString: d.offerParamsString ?? "",
          buyerAddress: d.buyerAddress ?? OFFER_OWNER_ADDRESS,
        }));
      } else if (Array.isArray(raw)) {
        for (const id of raw) {
          const det = await fcl.query({
            cadence: require("../flow/offers/getOfferDetails").getOfferDetails,
            args: (arg, t) => [arg(OFFER_OWNER_ADDRESS, t.Address), arg(String(id), t.UInt64)],
          });
          if (det) {
            normalized.push({
              offerId: String(id),
              purchased: det.purchased ?? "false",
              offerAmount: det.amount ?? det.offerAmount ?? "0.0",
              currency: det.currency ?? "FLOW",
              setIdParam: det?.resolver?.params?.setId ?? "",
              playIdParam: det?.resolver?.params?.playId ?? "",
              nftType: det?.nftType ?? "",
              resolverParam: det?.resolver?.type ?? "",
              offerParamsString: det?.resolver ? JSON.stringify(det.resolver) : "",
              buyerAddress: OFFER_OWNER_ADDRESS,
            });
          }
        }
      }
      const activeOffers = normalized.filter((o) => o.purchased !== "true" && o.purchased !== true);
      setOffers(activeOffers);
      fetchUsdAmounts(activeOffers).catch(() => {});
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
      isFetchingOffersRef.current = false;
    }
  }, []);

  const handleRefresh = async () => {
    try { setMatchesPage(1); smartRefreshUserData?.(); } catch {}
    try { await fetchOffers(); } catch {}
  };

  const fetchTreasuryBalance = async () => {
    try {
      const balance = await fcl.query({
        cadence: getFLOWBalance,
        args: (arg, t) => [arg(OFFER_OWNER_ADDRESS, t.Address)],
      });
      setTreasuryBalance(parseFloat(balance));
    } catch {
      setTreasuryBalance(0);
    }
  };

  const fetchFlowPrice = async () => {
    try {
      const price = await getFlowPrice();
      setFlowPrice(price);
    } catch {
      setFlowPrice(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await fetchOffers();
        await fetchTreasuryBalance();
        await fetchFlowPrice();
      }
    })();
    return () => { cancelled = true; };
  }, [fetchOffers]);

  useEffect(() => {
    if (txStatus === "Sealed" && !sealedHandledRef.current) {
      sealedHandledRef.current = true;
      try { smartRefreshUserData?.(); } catch {}
      fetchOffers().catch(() => {});
    }
    if (txStatus && txStatus !== "Sealed") sealedHandledRef.current = false;
  }, [txStatus, smartRefreshUserData, fetchOffers]);

  return (
    <div className="w-full px-4 space-y-2">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Treasury Bids</h1>
        <p className="text-brand-text/70 text-sm mb-3">Acquiring a curated collection of NBA Top Shot's most culturally significant assets.</p>
        <Link 
          to="/vaults/treasury" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors"
        >
          🏛️ View Treasury Collection
        </Link>
      </div>

      {!loading && !error && displayedOffers.length > 0 && (
        <div className="bg-brand-primary p-4 rounded-lg shadow-md shadow-black/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Offers Count */}
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-text">
                {displayedOffers.length}
              </div>
              <div className="text-sm text-brand-text/70">
                Active Offer{displayedOffers.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Total Active Offers Value */}
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text">
                ~{displayedOffers.reduce((sum, offer) => sum + parseFloat(offer.offerAmount), 0).toFixed(2)} FLOW
              </div>
              <div className="text-sm text-brand-text/70">
                Total Active Offers
                {(() => {
                  const usdAmount = convertFlowToUSDSync(displayedOffers.reduce((sum, offer) => sum + parseFloat(offer.offerAmount), 0));
                  return usdAmount ? (
                    <div className="text-xs text-brand-text/60 mt-1">
                      {formatUSD(usdAmount)} USD
                    </div>
                  ) : '';
                })()}
              </div>
            </div>

            {/* Treasury Balance */}
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text">
                {treasuryBalance.toFixed(2)} FLOW
              </div>
              <div className="text-sm text-brand-text/70">
                Treasury Balance
                {(() => {
                  const usdAmount = convertFlowToUSDSync(treasuryBalance);
                  return usdAmount ? (
                    <div className="text-xs text-brand-text/60 mt-1">
                      {formatUSD(usdAmount)} USD
                    </div>
                  ) : '';
                })()}
              </div>
            </div>

            {/* Current FLOW Price */}
            <div className="text-center">
              <div className="text-lg font-semibold text-brand-text">
                {flowPrice ? `$${flowPrice.toFixed(2)}` : '--'}
              </div>
              <div className="text-sm text-brand-text/70">
                FLOW Price
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="bg-brand-primary p-2 rounded-lg shadow-md shadow-black/30">
        {loading && <p className="text-sm text-brand-text/70">Loading offers…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && offers.length === 0 && (
          <p className="text-sm text-brand-text/70">No active offers found for {OFFER_OWNER_ADDRESS}.</p>
        )}
        {!loading && !error && displayedOffers.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 text-sm text-brand-text/70 gap-1">
              <p className="text-center sm:text-left">Showing all {displayedOffers.length.toLocaleString()} offers</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1.5 sm:gap-2 justify-items-center">
              {displayedOffers.map((o) => (
                <EditionOfferCard key={o.offerId} offer={o} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-brand-primary p-2 rounded-lg shadow-md shadow-black/30">
        {(() => {
          const parentAddr = accountData?.parentAddress?.toLowerCase?.();
          const parentCount = (parentAddr && matchCounts[parentAddr]) || 0;
          const childAddrs = Array.isArray(accountData?.childrenAddresses) ? accountData.childrenAddresses.map((a) => a?.toLowerCase?.()).filter(Boolean) : [];
          const childrenTotal = childAddrs.reduce((sum, a) => sum + (matchCounts[a] || 0), 0);
          const total = parentCount + childrenTotal;
          return (<h2 className="text-lg font-semibold mb-1">Matching Moments ({total})</h2>);
        })()}

        {/* Account Selection (left-aligned) */}
        <div className="mb-1 flex flex-col sm:flex-row sm:items-center gap-2">
          <div>
            <AccountSelection
              parentAccount={{ addr: accountData?.parentAddress, hasCollection: accountData?.hasCollection, ...accountData }}
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
          <button onClick={handleRefresh} disabled={loading} className="px-2 py-1 text-xs bg-brand-secondary text-brand-text/80 hover:opacity-80 disabled:opacity-50 rounded flex-shrink-0">{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>

        {!userHasCollection ? (
          <p className="text-sm text-brand-text/70">Connect your wallet to view eligible Moments.</p>
        ) : matchingMoments.length === 0 ? (
          <p className="text-sm text-brand-text/70">No matching Moments found for the selected account.</p>
        ) : (
          <div className="space-y-2">
            {matchesPageCount > 1 && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 text-sm text-brand-text/70 gap-1">
                <p className="text-center sm:text-left">Showing {paginatedMatches.length} of {matchingMoments.length.toLocaleString()} matches</p>
                <p className="text-center sm:text-right">Page {matchesPage} of {matchesPageCount}</p>
              </div>
            )}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-1 sm:gap-1.5 justify-items-center">
              {paginatedMatches.map((match, index) => (
                <div key={index} className="group relative flex flex-col items-center transition-all duration-150 ease-in-out hover:shadow-lg hover:-translate-y-0.5">
                  <MomentCard nft={match.moment} disableHover />
                  <div className="mt-0 flex flex-col gap-0">
                    <button className="w-[80px] sm:w-28 bg-opolis text-white text-[11px] rounded-b hover:bg-opolis-dark -mt-px h-[40px] flex flex-col items-center justify-center text-center leading-tight px-2 group-hover:bg-opolis/90" aria-label={`Accept offer for Moment #${match.moment.id} (Set ${match.moment.setID}, Play ${match.moment.playID})`} title={`Accept offer for Moment #${match.moment.id}`} onClick={() => onAcceptOffer(match)}>
                      <span className="font-semibold">Accept Offer</span>
                      <span className="font-semibold">{parseFloat(match.offer.offerAmount).toFixed(2)} {String(match.offer.currency || 'FLOW').toUpperCase()}{usdAmounts[match.offer.offerId] && ` ~${formatUSD(usdAmounts[match.offer.offerId])} USD`}</span>
                    </button>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[72%] sm:top-[74%] rounded-lg bg-black/5 ring-1 ring-inset ring-white/10 opacity-0 transition-opacity duration-150 group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
            {matchesPageCount > 1 && (
              <div className="flex justify-center items-center gap-3 mt-3">
                <button onClick={() => setMatchesPage(Math.max(1, matchesPage - 1))} disabled={matchesPage === 1} className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50">Prev</button>
                <span className="text-sm text-brand-text/70 min-w-[100px] text-center">Page {matchesPage} of {matchesPageCount}</span>
                <button onClick={() => setMatchesPage(Math.min(matchesPageCount, matchesPage + 1))} disabled={matchesPage === matchesPageCount} className="px-3 py-1 rounded bg-brand-primary text-brand-text/80 hover:opacity-80 disabled:opacity-50">Next</button>
              </div>
            )}
          </div>
        )}
      </section>

      {txModal.open && (
        <TransactionModal
          status={txModal.status}
          txId={txId || txModal.txId}
          nftCount={1}
          tshotAmount={txModal.context?.amount}
          swapType={"OFFERS_ACCEPT"}
          transactionAction={"OFFERS_ACCEPT"}
          onClose={() => setTxModal({ open: false, status: null, txId: null, context: null })}
          revealedNFTDetails={txModal.context?.moment ? [txModal.context.moment] : []}
          momentDetails={txModal.context?.moment}
          offerDetails={txModal.context?.offer}
          usdAmount={usdAmounts[txModal.context?.offer?.offerId]}
        />
      )}
    </div>
  );
}



