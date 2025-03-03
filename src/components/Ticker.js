import React, { useEffect, useState } from "react";
import * as fcl from "@onflow/fcl";
import Marquee from "react-fast-marquee";

// Example scripts
import { getTSHOTSupply } from "../flow/getTSHOTSupply";
import { getTSHOTPrice } from "../flow/getTSHOTPrice";
import { getFlowPricePerNFT } from "../flow/getFlowPricePerNFT";
import { getFLOWBalance } from "../flow/getFLOWBalance";

// Simple formatting helpers
const formatNumber = (num, digits = 2) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);

const formatUSD = (num, noDecimals = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2,
  }).format(num);

// Icon URLs
const TSHOT_ICON = "https://storage.googleapis.com/vaultopolis/TSHOT.png";
const FLOW_ICON = "https://storage.googleapis.com/vaultopolis/FLOW.png";
const VAULTOPOLIS_ICON =
  "https://storage.googleapis.com/vaultopolis/Vaultopolis.png";

function Ticker() {
  const [tshotPriceUSD, setTshotPriceUSD] = useState(null);
  const [tshotSupply, setTshotSupply] = useState(null);
  const [floorPriceUSD, setFloorPriceUSD] = useState(null);
  const [flowPriceUSD, setFlowPriceUSD] = useState(null);
  const [vaultRateUSD, setVaultRateUSD] = useState(null);
  const [vaultBalanceUSD, setVaultBalanceUSD] = useState(null);

  // Fetch data once on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // 1) TSHOT supply
        const supplyRes = await fcl.query({ cadence: getTSHOTSupply });
        setTshotSupply(Number(supplyRes));

        // 2) TSHOT => FLOW ratio
        const tshotFlowRatioRes = await fcl.query({ cadence: getTSHOTPrice });
        const tshotFlowNum = Number(tshotFlowRatioRes);

        // 3) Floor data
        const floorRes = await fetch(
          "https://flowconnectbackend-864654c6a577.herokuapp.com/api/floor-price"
        );
        if (!floorRes.ok) {
          throw new Error(`HTTP Error: ${floorRes.status}`);
        }
        const floorData = await floorRes.json();
        const flowUsd = floorData.flowPriceUSD || 0;
        const floorUsd = floorData.floorPriceUSD || 0;
        setFlowPriceUSD(flowUsd);
        setFloorPriceUSD(floorUsd);

        // TSHOT in USD
        setTshotPriceUSD(tshotFlowNum * flowUsd);

        // 4) Vaultopolis Rate (FLOW => USD)
        const vaultRateRes = await fcl.query({
          cadence: getFlowPricePerNFT,
          args: (arg, t) => [],
        });
        const vaultRateFlow = Number(vaultRateRes);
        setVaultRateUSD(vaultRateFlow * flowUsd);

        // 5) Vaultopolis Balance (FLOW => USD)
        const vaultBalanceRes = await fcl.query({
          cadence: getFLOWBalance,
          args: (arg, t) => [arg("0xb1788d64d512026d", t.Address)],
        });
        const vaultBalanceFlow = Number(vaultBalanceRes);
        setVaultBalanceUSD(Math.round(vaultBalanceFlow * flowUsd));
      } catch (err) {
        console.error("Ticker fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // Safely format or fallback
  const tshotStr = tshotPriceUSD == null ? "..." : formatUSD(tshotPriceUSD);
  const supplyStr = tshotSupply == null ? "..." : formatNumber(tshotSupply, 0);
  const floorStr = floorPriceUSD == null ? "..." : formatUSD(floorPriceUSD);
  const flowStr = flowPriceUSD == null ? "..." : formatUSD(flowPriceUSD);
  const vaultRateStr = vaultRateUSD == null ? "..." : formatUSD(vaultRateUSD);
  const vaultBalStr =
    vaultBalanceUSD == null ? "..." : formatUSD(vaultBalanceUSD);

  // Helper component: inline-flex for icon + "Label: Value"
  const Item = ({ iconSrc, iconStyle = {}, label, value }) => (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      {iconSrc && (
        <img
          src={iconSrc}
          alt={label}
          style={{
            marginRight: 6,
            ...iconStyle, // merge custom style
          }}
        />
      )}
      <span>
        {label}: {value}
      </span>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#333", color: "#fff", padding: "8px" }}>
      <Marquee
        gradient={false}
        speed={40} // bigger => faster
        pauseOnHover={true}
      >
        {/* TSHOT Price (bigger 30x30 icon) */}
        <Item
          iconSrc={TSHOT_ICON}
          iconStyle={{ width: 30, height: 30 }}
          label="TSHOT Price"
          value={tshotStr}
        />
        &nbsp; | &nbsp;
        {/* TSHOT Supply (also bigger 30x30 icon) */}
        <Item
          iconSrc={TSHOT_ICON}
          iconStyle={{ width: 30, height: 30 }}
          label="TSHOT Supply"
          value={supplyStr}
        />
        &nbsp; | &nbsp;
        {/* TopShot Floor (no icon) */}
        <Item label="TopShot Floor" value={floorStr} />
        &nbsp; | &nbsp;
        {/* FLOW (bigger 30x30 icon) */}
        <Item
          iconSrc={FLOW_ICON}
          iconStyle={{ width: 30, height: 30 }}
          label="FLOW"
          value={flowStr}
        />
        &nbsp; | &nbsp;
        {/* Vaultopolis Buying Rate (preserve aspect ratio => height=24, width=auto) */}
        <Item
          iconSrc={VAULTOPOLIS_ICON}
          iconStyle={{ height: 24, width: "auto" }}
          label="Buying Rate"
          value={vaultRateStr}
        />
        &nbsp; | &nbsp;
        {/* Vaultopolis Buying Balance (preserve aspect ratio => height=24, width=auto) */}
        <Item
          iconSrc={VAULTOPOLIS_ICON}
          iconStyle={{ height: 24, width: "auto" }}
          label="Buying Balance"
          value={vaultBalStr}
        />
        &nbsp; | &nbsp;
      </Marquee>
    </div>
  );
}

export default Ticker;
