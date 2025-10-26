// Migrate implementation from Offers.js: import and re-export default
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import { useAllDayContext } from "../context/AllDayContext";
import * as fcl from "@onflow/fcl";
import TransactionModal from "../components/TransactionModal";
import useTransaction from "../hooks/useTransaction";
import { acceptTopShotOffer } from "../flow/offers/acceptTopShotOffer";
import { acceptTopShotOffer_child } from "../flow/offers/acceptTopShotOffer_child";
import { getAllOfferDetails } from "../flow/offers/getAllOfferDetails";
import { getTopShotCollectionIDs } from "../flow/getTopShotCollectionIDs";
import AccountSelection from "../components/AccountSelection";
import { tierStyles } from "../components/MomentCard";
import { convertFlowToUSD, convertFlowToUSDSync, formatUSD, getFlowPrice } from "../utils/flowPrice";
import { FaLock } from "react-icons/fa";

export default function Bounties({ collectionType = 'topshot' }) {
  const navigate = useNavigate();
  
  const {
    accountData,
    selectedAccount,
    selectedAccountType,
    dispatch,
    metadataCache,
    smartRefreshUserData,
  } = React.useContext(UserDataContext);
  
  const { allDayMetadataCache, allDayCollectionData, fetchAllDayCollection, fetchAllDayCollectionDetails, setAllDayCollectionData } = useAllDayContext();
  const OFFER_OWNER_ADDRESS = "0xd69b6ce48815d4ad";

  // Load AllDay collection data when on AllDay bounties page
  useEffect(() => {
    if (collectionType === 'allday') {
      const currentAddress = selectedAccount || accountData?.parentAddress;
      if (currentAddress && !allDayCollectionData[currentAddress]) {
        const loadAllDayData = async () => {
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
        loadAllDayData();
      }
    }
  }, [collectionType, selectedAccount, accountData?.parentAddress, allDayCollectionData, fetchAllDayCollection, fetchAllDayCollectionDetails, setAllDayCollectionData]);
  const [loading, setLoading] = useState(false);
  const isFetchingOffersRef = useRef(false);
  const sealedHandledRef = useRef(false);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  const [txModal, setTxModal] = useState({ open: false, status: null, txId: null, context: null });
  const { sendTransaction, status: txStatus, txId } = useTransaction();
  const [matchesPage, setMatchesPage] = useState(1);
  const [usdAmounts, setUsdAmounts] = useState({});
  const [flowPrice, setFlowPrice] = useState(null);
  const [treasuryGrailsCount, setTreasuryGrailsCount] = useState(0);
  const MATCHES_PER_PAGE = 24;

  // Fetch treasury grails count
  useEffect(() => {
    const fetchTreasuryGrailsCount = async () => {
      try {
        const ids = await fcl.query({
          cadence: getTopShotCollectionIDs,
          args: (arg, t) => [arg("0xd69b6ce48815d4ad", t.Address)],
        });
        const normalized = Array.isArray(ids) ? ids.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];
        setTreasuryGrailsCount(normalized.length);
      } catch (e) {
        console.error("Failed to fetch treasury grails count:", e);
        setTreasuryGrailsCount(0);
      }
    };
    
    fetchTreasuryGrailsCount();
  }, []);

  const EditionOfferCard = ({ offer }) => {
    const setId = offer.__setId;
    const playId = offer.__playId;
    
    // Use appropriate metadata cache and key based on collection type
    const isAllDayOffer = collectionType === 'allday';
    let meta = null;
    let editionId = null;
    
    if (isAllDayOffer) {
      // AllDay offers use editionID directly from offerParamsString
      editionId = offer.offerParamsString?.editionId || offer.offerParamsString?.editionID;
      meta = editionId && allDayMetadataCache ? allDayMetadataCache[editionId] : null;
    } else {
      // TopShot uses setId-playId as key
      const metaKey = setId && playId ? `${setId}-${playId}` : null;
      meta = metaKey && metadataCache ? metadataCache[metaKey] : null;
    }
    
    // Use AllDay-specific field names for AllDay offers
    const player = isAllDayOffer 
      ? (meta?.playerName || meta?.FullName || "Unknown Player")
      : (meta?.FullName || meta?.name || "Unknown Player");
    const setName = isAllDayOffer 
      ? (meta?.setName || meta?.name || "Unknown Set")
      : (meta?.name || "Unknown Set");
    const series = meta?.series !== undefined ? String(meta.series) : "?";
    const tier = meta?.tier || "";
    const totalMinted = meta?.momentCount || meta?.subeditionMaxMint || meta?.maxMintSize || "?";

    // Use correct image URL format based on collection type
    const imageUrl = isAllDayOffer 
      ? null // Disable AllDay images for now
      : `https://storage.googleapis.com/flowconnect/topshot/images_small/${setId}_${playId}.jpg`;

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
          <div className="relative overflow-hidden rounded mx-auto mb-2 flex-shrink-0 p-1" style={{ height: '140px', width: '100%' }}>
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
              <div className="bg-green-500/10 border border-green-500/30 rounded px-2 py-1 mb-2">
                <p className="text-center text-[11px] sm:text-xs font-bold text-green-400 truncate leading-tight mb-0">
                {parseFloat(offer.offerAmount).toFixed(2)} {String(offer.currency || 'FLOW').toUpperCase()}
              </p>
              {usdAmounts[offer.offerId] && (
                  <p className="text-center text-[10px] sm:text-xs font-semibold text-green-400/80 truncate leading-tight mb-0">
                  ~{formatUSD(usdAmounts[offer.offerId])} USD
                </p>
              )}
              </div>
              <p 
                className="text-center text-[8px] sm:text-[9px] text-brand-text/50 truncate leading-tight mb-0 cursor-pointer hover:text-brand-text/70 transition-colors"
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
    }).filter((offer) => {
      // Filter offers based on collection type
      if (collectionType === 'topshot') {
        // TopShot offers - exclude NFL AllDay offers
        const resolver = String(offer.__resolver || '').toLowerCase();
        const nftTypeId = String(offer.nftType?.typeID || '').toLowerCase();
        const offerTypeId = String(offer.offerParamsString?.typeId || '').toLowerCase();
        const isAllDay = resolver.includes('allday') || resolver.includes('nfl') || nftTypeId.includes('allday') || offerTypeId.includes('allday');
        
        return !isAllDay;
      } else if (collectionType === 'allday') {
        // AllDay offers - check multiple possible fields for AllDay identification
        const resolver = String(offer.__resolver || '').toLowerCase();
        const nftTypeId = String(offer.nftType?.typeID || '').toLowerCase();
        const offerTypeId = String(offer.offerParamsString?.typeId || '').toLowerCase();
        const offerParamsString = String(offer.offerParamsString || '').toLowerCase();
        
        // Check if this is an AllDay offer using multiple criteria
        const isAllDay = resolver.includes('allday') || resolver.includes('nfl') || 
                        nftTypeId.includes('allday') || nftTypeId.includes('nfl') ||
                        offerTypeId.includes('allday') || offerTypeId.includes('nfl') ||
                        offerParamsString.includes('allday') || offerParamsString.includes('nfl') ||
                        // Check if offer has editionId (AllDay specific)
                        (offer.offerParamsString && (offer.offerParamsString.editionId || offer.offerParamsString.editionID));
        
        return isAllDay;
      }
      return true; // Default to showing all if collectionType is not recognized
    }).sort((a, b) => {
      const amountA = parseFloat(a.offerAmount || 0);
      const amountB = parseFloat(b.offerAmount || 0);
      return amountB - amountA;
    });
  }, [offers, collectionType]);



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
    if (!displayedOffers.length) return [];
    const matches = [];
    const offerMap = new Map();
    
    // Build offer map based on collection type
    displayedOffers.forEach(offer => {
      if (collectionType === 'allday') {
        // AllDay offers use editionId directly (convert to string for consistent matching)
        const editionId = offer.offerParamsString?.editionId || offer.offerParamsString?.editionID;
        if (editionId) {
          const key = String(editionId);
          offerMap.set(key, offer);
        }
      } else {
        // TopShot offers use editionKey format
        if (offer.__editionKey) offerMap.set(offer.__editionKey, offer);
      }
    });
    
    // Get moments based on collection type
    let momentsToCheck = [];
    if (collectionType === 'allday') {
      // Use AllDay moments from AllDay context
      const currentAddress = selectedAccount || accountData?.parentAddress;
      const addressData = allDayCollectionData[currentAddress];
      momentsToCheck = addressData?.nftDetails || [];
      
    } else {
      // Use TopShot moments from user context
      momentsToCheck = activeAccountData?.nftDetails || [];
    }
    
    // Check moments for matches
    momentsToCheck.forEach(moment => {
      let matchKey = null;
      
      if (collectionType === 'allday') {
        // AllDay moments use editionID directly (convert to string for consistent matching)
        matchKey = String(moment.editionID);
      } else {
        // TopShot moments use setId-playId format
        matchKey = `${moment.setID}_${moment.playID}`;
      }
      
      if (matchKey && offerMap.has(matchKey)) {
        const isLocked = moment.isLocked || false;
        matches.push({ 
          moment, 
          offer: offerMap.get(matchKey),
          isLocked: isLocked
        });
      }
    });
    
    return matches;
  }, [displayedOffers, activeAccountData?.nftDetails, collectionType, selectedAccount, accountData?.parentAddress, allDayCollectionData]);

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
    <div className="w-full space-y-2">
      {/* Project Tabs */}
      <div className="bg-brand-primary p-3 sm:p-4 rounded-lg mb-4">
        <div className="max-w-6xl mx-auto mx-2 sm:mx-4">
          <div className="flex items-center gap-2" role="tablist" aria-label="Project sections">
            <button
              onClick={() => navigate('/bounties/topshot')}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                collectionType === 'topshot'
                  ? 'border-brand-accent text-brand-accent bg-brand-secondary'
                  : 'border-brand-border text-brand-text/90 bg-brand-secondary hover:bg-brand-blue'
              }`}
            >
              <span className="text-sm sm:text-base">Top Shot</span>
            </button>
          </div>
        </div>
      </div>

      {!loading && !error && displayedOffers.length > 0 && (
        <div className="bg-brand-primary p-3 sm:p-4 rounded-lg">
          <div className="max-w-6xl mx-auto mx-2 sm:mx-4">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-brand-text mb-2">
                Overview
              </h2>
              <p className="text-brand-text/70 text-sm mb-4 leading-relaxed">
                We are actively acquiring higher-end grails and culturally significant moments to add to our treasury for future innovative products and community initiatives.
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Active Offers Count */}
              <div className="text-center bg-brand-secondary rounded-lg p-3 flex flex-col justify-center min-h-[80px]">
                <div className="text-xl sm:text-2xl font-bold text-brand-text">
                  {displayedOffers.length}
                </div>
                <div className="text-xs sm:text-sm text-brand-text/70">
                  Active Grail Bount{displayedOffers.length !== 1 ? 'ies' : 'y'}
                </div>
              </div>

              {/* Treasury Grails Acquired */}
              <div className="text-center bg-brand-secondary rounded-lg p-3 flex flex-col justify-center min-h-[80px]">
                <Link 
                  to="/vaults/treasury" 
                  className="block hover:bg-brand-secondary/80 rounded-lg p-2 transition-colors flex flex-col justify-center h-full"
                >
                  <div className="text-xl sm:text-2xl font-bold text-brand-text">
                    {treasuryGrailsCount.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-brand-text/70">
                    Treasury Grails Acquired
                  </div>
                  <div className="text-xs text-brand-accent mt-1">
                    View Vault →
                  </div>
                </Link>
              </div>

              {/* Sum of Bids */}
              <div className="text-center bg-brand-secondary rounded-lg p-3 flex flex-col justify-center min-h-[80px]">
                <div className="text-sm sm:text-lg font-semibold text-brand-text">
                  ~{Math.round(displayedOffers.reduce((sum, offer) => sum + parseFloat(offer.offerAmount), 0)).toLocaleString()} FLOW
                </div>
                <div className="text-xs sm:text-sm text-brand-text/70">
                  Sum of Bids
                  {(() => {
                    const usdAmount = convertFlowToUSDSync(displayedOffers.reduce((sum, offer) => sum + parseFloat(offer.offerAmount), 0));
                    return usdAmount ? (
                      <div className="text-xs text-brand-text/60">
                        ${Math.round(usdAmount).toLocaleString()} USD
                      </div>
                    ) : '';
                  })()}
                </div>
              </div>

              {/* Current FLOW Price */}
              <div className="text-center bg-brand-secondary rounded-lg p-3 flex flex-col justify-center min-h-[80px]">
                <div className="text-sm sm:text-lg font-semibold text-brand-text">
                  {flowPrice ? `$${flowPrice.toFixed(2)}` : '--'}
                </div>
                <div className="text-xs sm:text-sm text-brand-text/70">
                  FLOW Price
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matching Moments Section - Moved Above Bounties */}
      {accountData && accountData.parentAddress && (
        <section className="bg-brand-primary p-4 rounded-lg">
          <div className="mb-4">
            {(() => {
              const parentAddr = accountData?.parentAddress?.toLowerCase?.();
              const parentCount = (parentAddr && matchCounts[parentAddr]) || 0;
              const childAddrs = Array.isArray(accountData?.childrenAddresses) ? accountData.childrenAddresses.map((a) => a?.toLowerCase?.()).filter(Boolean) : [];
              const childrenTotal = childAddrs.reduce((sum, a) => sum + (matchCounts[a] || 0), 0);
              const total = parentCount + childrenTotal;
              return (
                <>
                  <h2 className="text-xl font-bold text-brand-text mb-2">
                    Your Matching Moments ({total})
                  </h2>
                  <p className="text-sm text-brand-text/70">
                    Moments from your collection that match active offers
                  </p>
                </>
              );
            })()}
          </div>

          {/* Account Selection with Refresh Button */}
          {accountData && accountData.parentAddress && (
            <div className="mb-1 flex items-center gap-2">
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
              <button 
                onClick={handleRefresh} 
                disabled={loading} 
                className="px-3 py-2 text-sm bg-brand-secondary text-brand-text/80 hover:bg-brand-secondary/80 disabled:opacity-50 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          )}

          {!accountData || !accountData.parentAddress ? (
            <div className="text-center py-8">
              <p className="text-brand-text/70">Connect your wallet to view your matching moments</p>
            </div>
          ) : !userHasCollection ? (
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
              <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,140px))] sm:grid-cols-[repeat(auto-fit,minmax(160px,160px))] gap-1.5 justify-items-center">
                {paginatedMatches.map((match, index) => {
                  const moment = match.moment;
                  const setId = moment.setID;
                  const playId = moment.playID;
                  
                  // Use appropriate metadata cache and key based on collection type
                  const isAllDayMoment = collectionType === 'allday';
                  let meta = null;
                  
                  if (isAllDayMoment) {
                    // AllDay moments use editionID directly
                    const editionId = moment.editionID;
                    meta = editionId && allDayMetadataCache ? allDayMetadataCache[editionId] : null;
                  } else {
                    // TopShot uses setId-playId as key
                    const metaKey = setId && playId ? `${setId}-${playId}` : null;
                    meta = metaKey && metadataCache ? metadataCache[metaKey] : null;
                  }
                  
                  // Use AllDay-specific field names for AllDay moments
                  const player = isAllDayMoment 
                    ? (meta?.playerName || meta?.FullName || "Unknown Player")
                    : (meta?.FullName || meta?.name || "Unknown Player");
                  const setName = isAllDayMoment 
                    ? (meta?.setName || meta?.name || "Unknown Set")
                    : (meta?.name || "Unknown Set");
                  const series = meta?.series !== undefined ? String(meta.series) : "?";
                  const tier = meta?.tier || "";
                  const totalMinted = meta?.momentCount || meta?.subeditionMaxMint || meta?.maxMintSize || "?";
                  // Use correct image URL format based on collection type
                  const imageUrl = isAllDayMoment 
                    ? null // Disable AllDay images for now
                    : `https://storage.googleapis.com/flowconnect/topshot/images_small/${setId}_${playId}.jpg`;
                  const tierClass = tier ? tierStyles[tier.toLowerCase()] || "text-gray-400" : "text-gray-400";

                  const isLocked = match.isLocked;
                  
                  return (
                    <div key={index} className={`group relative flex flex-col items-center transition-all duration-200 ease-in-out ${isLocked ? '' : 'hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1'}`}>
                      <div className={`w-[140px] sm:w-40 rounded overflow-hidden flex flex-col pt-2 px-1 border text-brand-text select-none transition-all duration-200 ${isLocked ? 'border-brand-text/40 bg-black' : 'border-brand-text/40 bg-black hover:shadow-lg hover:shadow-black/40 hover:border-brand-accent/60'}`} style={{ height: '280px' }}>
                        <div className="relative overflow-hidden rounded mx-auto w-full aspect-square">
                          <img
                            src={imageUrl}
                            alt={`${player} moment`}
                            loading="lazy"
                            decoding="async"
                            className={`object-cover w-full h-full transform scale-150 ${isLocked ? 'opacity-60' : ''}`}
                            style={{ objectPosition: "center 20%" }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="hidden absolute inset-0 w-full h-full bg-gray-700 items-center justify-center">
                            <div className="text-gray-400 text-xs text-center">No Image</div>
                          </div>
                          {/* Lock icon overlay for locked moments */}
                          {isLocked && (
                            <div className="absolute top-1 right-1 bg-red-600 rounded-full p-1.5 shadow-lg border border-red-400">
                              <FaLock size={10} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between pb-1">
                          <div>
                            <h3 className="text-center font-semibold leading-tight h-[24px] sm:h-[28px] flex items-center justify-center text-[10px] sm:text-xs">
                              {player}
                            </h3>
                            <p className="text-center text-[10px] sm:text-xs text-brand-text/60 leading-tight h-[12px] sm:h-[14px] flex items-center justify-center">
                              Series {series}
                            </p>
                            <p className={`text-center text-[10px] sm:text-xs truncate leading-tight ${tierClass} h-[12px] sm:h-[14px] flex items-center justify-center`}>
                              {tier ? tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase() : ""}
                            </p>
                            <p className="text-center text-brand-text/50 leading-tight min-h-[24px] sm:min-h-[28px] flex items-center justify-center text-[10px] sm:text-xs">
                              {setName}
                            </p>
                            <p className="text-center text-[10px] sm:text-xs text-brand-text/50 truncate leading-tight h-[12px] sm:h-[14px] flex items-center justify-center">
                              {moment.serialNumber} / {totalMinted}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Accept Button - Disabled for locked moments */}
                      <button 
                        className={`w-[140px] sm:w-40 text-white text-xs rounded-b h-[50px] flex flex-col items-center justify-center text-center leading-tight px-2 transition-all duration-200 ${
                          isLocked 
                            ? 'bg-gray-500 cursor-not-allowed opacity-60' 
                            : 'bg-opolis hover:bg-opolis-dark hover:shadow-lg hover:shadow-opolis/30 group-hover:bg-opolis/90 group-hover:scale-105'
                        } -mt-px`}
                        aria-label={isLocked ? `Locked Moment #${match.moment.id} - Cannot accept offer` : `Accept offer for Moment #${match.moment.id} (Set ${match.moment.setID}, Play ${match.moment.playID})`}
                        title={isLocked ? `Locked Moment - Cannot accept offer` : `Accept offer for Moment #${match.moment.id}`}
                        onClick={isLocked ? undefined : () => onAcceptOffer(match)}
                        disabled={isLocked}
                      >
                        <span className="font-semibold text-xs">{isLocked ? 'Locked' : 'Accept'}</span>
                        <span className="font-semibold text-xs">{parseFloat(match.offer.offerAmount).toFixed(2)} FLOW</span>
                        {usdAmounts[match.offer.offerId] && (
                          <span className="font-semibold text-xs">~{formatUSD(usdAmounts[match.offer.offerId])}</span>
                        )}
                      </button>
                    </div>
                  );
                })}
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
      )}

      <section className="bg-brand-primary p-4 rounded-lg">
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-brand-text mb-2">
              Active Grail Bounties
            </h2>
            <p className="text-sm text-brand-text/70">
              Browse available bounties
            </p>
          </div>
          
          {loading && <p className="text-sm text-brand-text/70">Loading bounties…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!loading && !error && offers.length === 0 && (
            <p className="text-sm text-brand-text/70">No active bounties found for {OFFER_OWNER_ADDRESS}.</p>
          )}
          {!loading && !error && displayedOffers.length > 0 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 text-sm text-brand-text/70 gap-1">
                <p className="text-center sm:text-left">Showing all {displayedOffers.length.toLocaleString()} bounties</p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,130px))] sm:grid-cols-[repeat(auto-fit,minmax(150px,150px))] md:grid-cols-[repeat(auto-fit,minmax(140px,140px))] lg:grid-cols-[repeat(auto-fit,minmax(160px,160px))] gap-1.5 justify-items-center">
                {displayedOffers.map((o) => (
                  <EditionOfferCard key={o.offerId} offer={o} />
                ))}
              </div>
            </div>
          )}
        </div>
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

