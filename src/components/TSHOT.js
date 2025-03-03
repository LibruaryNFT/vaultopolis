import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";

// Components
import TSHOTInfo from "./TSHOTInfo";
import TSHOTVault from "./TSHOTVault";

// Cadence scripts
import { getTSHOTSupply } from "../flow/getTSHOTSupply";
import { getTSHOTPrice } from "../flow/getTSHOTPrice";

function TSHOT() {
  // ------------------ TSHOT Supply & Price States ------------------
  const [tshotSupply, setTshotSupply] = useState(null);
  const [loadingSupply, setLoadingSupply] = useState(true);

  const [priceFlow, setPriceFlow] = useState(null);
  const [priceUSD, setPriceUSD] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Fetch TSHOT supply and price on mount
  useEffect(() => {
    async function fetchSupply() {
      setLoadingSupply(true);
      try {
        const supply = await fcl.query({ cadence: getTSHOTSupply });
        setTshotSupply(Number(supply));
      } catch (err) {
        console.error("Failed to fetch TSHOT supply:", err);
      } finally {
        setLoadingSupply(false);
      }
    }

    async function fetchPrice() {
      setLoadingPrice(true);
      try {
        // TSHOT => FLOW ratio
        const flowVal = await fcl.query({ cadence: getTSHOTPrice });
        const flowPerTshot = Number(flowVal);
        setPriceFlow(flowPerTshot);

        // fetch flowPriceUSD from your backend
        const res = await fetch(
          "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price"
        );
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }
        const data = await res.json();
        const flowPriceUSD = Number(data.flowPriceUSD || 0);

        // TSHOT => USD
        setPriceUSD(flowPerTshot * flowPriceUSD);
      } catch (err) {
        console.error("Failed to fetch TSHOT price or Flow->USD:", err);
      } finally {
        setLoadingPrice(false);
      }
    }

    fetchSupply();
    fetchPrice();
  }, []);

  return (
    <div className="w-full text-white space-y-4">
      {/* TSHOTInfo: pass in the supply/price states & loading flags */}
      <TSHOTInfo
        tshotSupply={tshotSupply}
        loadingSupply={loadingSupply}
        priceFlow={priceFlow}
        priceUSD={priceUSD}
        loadingPrice={loadingPrice}
      />

      {/* TSHOTVault: handles vault filters & display (now enriched with jerseyNumber) */}
      <TSHOTVault />
    </div>
  );
}

export default TSHOT;
