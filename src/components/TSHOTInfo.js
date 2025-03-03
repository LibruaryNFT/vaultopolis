import React from "react";
import {
  Repeat,
  CircleDollarSign,
  DollarSign,
  ShieldCheck,
  Dice5,
  Coins,
  Loader2,
  Globe2,
} from "lucide-react";

/**
 * Helper for USD formatting (can also be placed in a utilities file)
 */
const formatUSD = (val) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
};

function TSHOTInfo({
  tshotSupply,
  loadingSupply,
  priceFlow,
  priceUSD,
  loadingPrice,
}) {
  return (
    <div className="w-full text-white space-y-4">
      {/* TSHOT Icon + Title */}
      <div className="flex items-center gap-2 mb-2 justify-center">
        <img
          src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
          alt="TSHOT Icon"
          style={{ width: "96px", height: "96px" }}
        />
        <h2 className="text-2xl font-bold">What is TSHOT?</h2>
      </div>

      {/* 6 squares describing TSHOT features */}
      <div className="bg-gray-700 p-3 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 text-center">
          {/* 1) Convert Moments to TSHOT */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <ShieldCheck className="w-5 h-5 text-purple-400 mr-1" />
              Convert Moments to TSHOT
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Deposit Common/Fandom Moments at a 1:1 ratio in the shared
              vault—perfect for freeing up your collection.
            </p>
            <a
              href="/exchange"
              className="bg-purple-500 hover:bg-purple-600 text-xs text-white font-bold px-2 py-1 rounded"
              style={{ width: "auto" }}
            >
              Exchange Now
            </a>
          </div>

          {/* 2) Upgrade Your Moments */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Dice5 className="w-5 h-5 text-purple-300 mr-1" />
              Upgrade Your Moments
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Use TSHOT to acquire fresh random Common/Fandom Moments—sometimes
              seeded with special surprises!
            </p>
            <a
              href="/exchange"
              className="bg-purple-500 hover:bg-purple-600 text-xs text-white font-bold px-2 py-1 rounded"
              style={{ width: "auto" }}
            >
              Upgrade Now
            </a>
          </div>

          {/* 3) Instant Liquidity */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Globe2 className="w-5 h-5 text-pink-400 mr-1" />
              Instant Liquidity
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Swap TSHOT to FLOW (or other tokens) anytime for quick access to
              broader liquidity.
            </p>
            <a
              href="https://app.increment.fi/swap?in=A.05b67ba314000b2d.TSHOT&out=A.1654653399040a61.FlowToken"
              target="_blank"
              rel="noreferrer"
              className="bg-pink-500 hover:bg-pink-600 rounded text-xs font-bold px-2 py-1"
              style={{ width: "auto", margin: "0 auto" }}
            >
              Sell Now
            </a>
          </div>

          {/* 4) Earn Passive Yield */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <CircleDollarSign className="w-5 h-5 text-green-400 mr-1" />
              Earn Passive Yield
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Provide TSHOT liquidity to earn ongoing rewards. More features &
              integrations coming soon!
            </p>
            <div className="flex gap-1 mt-auto">
              <a
                href="https://app.increment.fi/liquidity/add"
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 hover:bg-green-600 rounded text-xs font-bold px-2 py-1"
                style={{ width: "auto" }}
              >
                Add Liquidity
              </a>
              <a
                href="https://app.increment.fi/farm"
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 hover:bg-green-600 rounded text-xs font-bold px-2 py-1"
                style={{ width: "auto" }}
              >
                Farm
              </a>
            </div>
          </div>

          {/* 5) Use Dapper Wallet Moments */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Repeat className="w-5 h-5 text-blue-400 mr-1" />
              Use Your Dapper Wallet Moments
            </div>
            <p className="text-xs text-gray-100 mb-2">
              Seamlessly leverage Dapper Wallet assets on TSHOT—no need to move
              them elsewhere.
            </p>
            <a
              href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
              target="_blank"
              rel="noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-xs text-white font-bold px-2 py-1 rounded"
              style={{ width: "auto" }}
            >
              Learn More
            </a>
          </div>

          {/* 6) TSHOT Stats (Supply + Price) */}
          <div className="bg-gray-600 p-3 rounded flex flex-col items-center justify-center">
            <div className="flex items-center justify-center text-base font-bold text-white mb-1">
              <Coins className="w-5 h-5 text-blue-300 mr-1" />
              TSHOT Stats
            </div>
            {/* Supply */}
            {loadingSupply ? (
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
                <p className="text-xs text-gray-300">Loading supply...</p>
              </div>
            ) : tshotSupply !== null ? (
              <p className="text-xs text-blue-300">
                Supply: {Math.floor(tshotSupply)}
              </p>
            ) : (
              <p className="text-xs text-gray-300">Supply: Error</p>
            )}
            {/* Price */}
            {loadingPrice ? (
              <div className="flex items-center gap-2 justify-center mt-1">
                <Loader2 className="h-5 w-5 text-gray-300 animate-spin" />
                <p className="text-xs text-gray-300">Loading price...</p>
              </div>
            ) : priceFlow !== null ? (
              <p className="text-xs text-lime-300 mt-1">
                Price: {priceFlow.toFixed(4)} FLOW{" "}
                {priceUSD ? `| ${formatUSD(priceUSD)} USD` : ""}
              </p>
            ) : (
              <p className="text-xs text-gray-300 mt-1">Price: Error</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TSHOTInfo;
