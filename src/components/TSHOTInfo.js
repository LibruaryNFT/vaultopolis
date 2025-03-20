// src/components/TSHOTInfo.jsx

import React from "react";
import {
  Repeat,
  CircleDollarSign,
  ShieldCheck,
  Dice5,
  Globe2,
} from "lucide-react";

function TSHOTInfo() {
  return (
    <div className="text-brand-text">
      {/* ========== HERO SECTION ========== */}
      <div
        className="
          bg-gradient-to-b
          from-brand-primary
          to-brand-secondary
          py-8
          px-4
        "
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left column: Text content */}
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              What is TSHOT?
            </h1>
            <p className="text-sm sm:text-base text-brand-text/80 mb-6 max-w-xl">
              TSHOT is a fungible token backed by Top Shot Common/Fandom
              Moments. Deposit Moments at a 1:1 ratio to receive TSHOT—or redeem
              TSHOT for random Moments from the TSHOT Vault. Instantly buy or
              sell Moments in bulk, earn passive yield, and more.
            </p>
            <a
              href="/swap"
              className="
                inline-block
                bg-purple-600
                hover:bg-purple-700
                text-white
                font-bold
                py-2
                px-4
                rounded
                transition-colors
              "
            >
              Swap Now
            </a>
          </div>

          {/* Right column: Hero Image with hover effect */}
          <div className="flex justify-center md:justify-end order-1 md:order-2 mb-6 md:mb-0">
            <img
              src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
              alt="TSHOT Icon"
              className="
                w-48
                h-48
                sm:w-64
                sm:h-64
                object-contain
                transform
                transition
                duration-300
                hover:scale-105
              "
            />
          </div>
        </div>
      </div>

      {/* ========== CORE MECHANICS SECTION ========== */}
      <div className="bg-brand-primary py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center md:text-left">
            Core Mechanics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Convert Moments to TSHOT */}
            <div
              className="
                bg-brand-secondary
                p-6
                rounded-lg
                flex
                flex-col
                transition-transform
                duration-300
                hover:scale-105
                hover:opacity-90
              "
            >
              <div className="flex items-center text-base font-bold mb-2">
                <ShieldCheck className="w-5 h-5 text-purple-400 mr-2" />
                Convert Moments to TSHOT
              </div>
              <p className="text-xs text-brand-text/80 mb-4 flex-grow">
                Deposit Moments at a 1:1 ratio to receive TSHOT.
              </p>
              <a
                href="/swap"
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  text-xs
                  text-white
                  font-bold
                  py-2
                  px-3
                  rounded
                  mt-auto
                "
              >
                Swap Now
              </a>
            </div>

            {/* Card 2: Convert TSHOT to Moments */}
            <div
              className="
                bg-brand-secondary
                p-6
                rounded-lg
                flex
                flex-col
                transition-transform
                duration-300
                hover:scale-105
                hover:opacity-90
              "
            >
              <div className="flex items-center text-base font-bold mb-2">
                <Dice5 className="w-5 h-5 text-purple-300 mr-2" />
                Convert TSHOT to Moments
              </div>
              <p className="text-xs text-brand-text/80 mb-4 flex-grow">
                Redeem TSHOT to get random Moments from the TSHOT Vault.
              </p>
              <a
                href="/swap"
                className="
                  bg-purple-600
                  hover:bg-purple-700
                  text-xs
                  text-white
                  font-bold
                  py-2
                  px-3
                  rounded
                  mt-auto
                "
              >
                Convert Now
              </a>
            </div>

            {/* Card 3: Use Dapper Wallet Moments */}
            <div
              className="
                bg-brand-secondary
                p-6
                rounded-lg
                flex
                flex-col
                transition-transform
                duration-300
                hover:scale-105
                hover:opacity-90
              "
            >
              <div className="flex items-center text-base font-bold mb-2">
                <Repeat className="w-5 h-5 text-blue-400 mr-2" />
                Use Dapper Wallet Moments
              </div>
              <p className="text-xs text-brand-text/80 mb-4 flex-grow">
                Seamlessly leverage Moments stored in your Dapper Wallet.
              </p>
              <a
                href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
                target="_blank"
                rel="noreferrer"
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  text-xs
                  text-white
                  font-bold
                  py-2
                  px-3
                  rounded
                  mt-auto
                "
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MARKET ACCESS & UTILITY SECTION ========== */}
      <div className="bg-brand-secondary py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center md:text-left">
            Instant Market Access &amp; Utility
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Buy Moments Instantly */}
            <div
              className="
                bg-brand-primary
                p-6
                rounded-lg
                flex
                flex-col
                transition-transform
                duration-300
                hover:scale-105
                hover:opacity-90
              "
            >
              <div className="flex items-center text-base font-bold mb-2">
                <Globe2 className="w-5 h-5 text-pink-400 mr-2" />
                Buy Moments Instantly
              </div>
              <p className="text-xs text-brand-text/80 mb-4 flex-grow">
                Need Moments fast? Purchase TSHOT on-chain, then convert to
                random Moments.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <a
                  href="https://app.increment.fi/swap?in=A.1654653399040a61.FlowToken&out=A.05b67ba314000b2d.TSHOT"
                  target="_blank"
                  rel="noreferrer"
                  className="
                    bg-pink-600
                    hover:bg-pink-700
                    text-xs
                    text-white
                    font-bold
                    py-2
                    px-3
                    rounded
                  "
                >
                  Buy Now (Cadence) - Increment.fi
                </a>
                <a
                  href="https://swap.kittypunch.xyz/?tokens=0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e-0xc618a7356fcf601f694c51578cd94144deaee690"
                  target="_blank"
                  rel="noreferrer"
                  className="
                    bg-pink-600
                    hover:bg-pink-700
                    text-xs
                    text-white
                    font-bold
                    py-2
                    px-3
                    rounded
                  "
                >
                  Buy Now (FEVM) - PunchSwap
                </a>
              </div>
            </div>

            {/* Sell Moments Instantly */}
            <div
              className="
                bg-brand-primary
                p-6
                rounded-lg
                flex
                flex-col
                transition-transform
                duration-300
                hover:scale-105
                hover:opacity-90
              "
            >
              <div className="flex items-center text-base font-bold mb-2">
                <Globe2 className="w-5 h-5 text-pink-400 mr-2" />
                Sell Moments Instantly
              </div>
              <p className="text-xs text-brand-text/80 mb-4 flex-grow">
                Turn Moments into TSHOT, then swap TSHOT for FLOW or other
                tokens quickly.
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <a
                  href="https://app.increment.fi/swap?in=A.05b67ba314000b2d.TSHOT&out=A.1654653399040a61.FlowToken"
                  target="_blank"
                  rel="noreferrer"
                  className="
                    bg-pink-600
                    hover:bg-pink-700
                    text-xs
                    text-white
                    font-bold
                    py-2
                    px-3
                    rounded
                  "
                >
                  Sell Now (Cadence) - Increment.fi
                </a>
                <a
                  href="https://swap.kittypunch.xyz/?tokens=0xc618a7356fcf601f694c51578cd94144deaee690-0xd3bf53dac106a0290b0483ecbc89d40fcc961f3e"
                  target="_blank"
                  rel="noreferrer"
                  className="
                    bg-pink-600
                    hover:bg-pink-700
                    text-xs
                    text-white
                    font-bold
                    py-2
                    px-3
                    rounded
                  "
                >
                  Sell Now (FEVM) - PunchSwap
                </a>
              </div>
            </div>

            {/* Earn Passive Yield */}
            <div
              className="
                bg-brand-primary
                p-6
                rounded-lg
                flex
                flex-col
                transition-transform
                duration-300
                hover:scale-105
                hover:opacity-90
              "
            >
              <div className="flex items-center text-base font-bold mb-2">
                <CircleDollarSign className="w-5 h-5 text-green-400 mr-2" />
                Earn Passive Yield
              </div>
              <p className="text-xs text-brand-text/80 mb-4 flex-grow">
                Provide TSHOT liquidity to earn rewards. More DeFi integrations
                coming soon!
              </p>
              <div className="flex flex-col gap-2 mt-auto">
                <a
                  href="https://app.increment.fi/liquidity/add"
                  target="_blank"
                  rel="noreferrer"
                  className="
                    bg-green-600
                    hover:bg-green-700
                    text-xs
                    font-bold
                    text-white
                    py-2
                    px-3
                    rounded
                  "
                >
                  Add Liquidity (Cadence) - Increment.fi
                </a>
                <a
                  href="https://swap.kittypunch.xyz/?tab=liquidity&mode=add&token0=0xC618a7356FcF601f694C51578CD94144Deaee690&token1=0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e"
                  target="_blank"
                  rel="noreferrer"
                  className="
                    bg-green-600
                    hover:bg-green-700
                    text-xs
                    font-bold
                    text-white
                    py-2
                    px-3
                    rounded
                  "
                >
                  Add Liquidity (FEVM) - PunchSwap
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TSHOTInfo;
