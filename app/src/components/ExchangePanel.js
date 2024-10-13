import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import MomentCard from "./MomentCard";
import * as fcl from "@onflow/fcl";
import { getTier } from "../flow/getTier"; // Import the getTier script

const ExchangePanel = () => {
  const {
    tshotBalance,
    nftDetails,
    playerData,
    selectedNFTs,
    handleNFTSelection,
    swapTSHOTForNFT,
    exchangeNFTsForTSHOT,
    user,
  } = useContext(UserContext);

  const [isReversed, setIsReversed] = useState(true); // Default to NFT on top (Moment -> Tokens)
  const [tshotAmount, setTshotAmount] = useState(0); // TSHOT amount to swap
  const [selectedNftType, setSelectedNftType] = useState("TopShot - Common"); // Default to TopShot Common
  const [selectedToken, setSelectedToken] = useState("$TSHOT - TopShot Common"); // Default to $TSHOT
  const [tierData, setTierData] = useState({}); // Store tier data for each moment

  // Handle TSHOT input change - allowing only integers
  const handleTshotChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const integerValue = parseInt(value, 10);
      setTshotAmount(isNaN(integerValue) ? "" : integerValue); // If value is empty, set to empty string
    }
  };

  // Handle the swap button click
  const handleSwap = () => {
    if (isReversed) {
      exchangeNFTsForTSHOT(); // Swap NFTs for TSHOT
    } else {
      swapTSHOTForNFT(`${tshotAmount}.0`); // Swap TSHOT for NFTs
    }
    setTshotAmount(0); // Reset the inputs after a successful transaction
  };

  // Fetch the tier for each moment and store it
  useEffect(() => {
    const fetchTiers = async () => {
      const tierInfo = {};
      for (const nft of nftDetails) {
        try {
          const tier = await fcl.query({
            cadence: getTier,
            args: (arg, t) => [
              arg(user.addr, t.Address),
              arg(nft.id, t.UInt64),
            ],
          });
          tierInfo[nft.id] = tier;
        } catch (error) {
          console.error(`Error fetching tier for moment ID ${nft.id}:`, error);
        }
      }
      setTierData(tierInfo);
    };

    if (user.loggedIn && nftDetails.length > 0) {
      fetchTiers(); // Only fetch tiers when the user is logged in and moments are available
    }
  }, [user, nftDetails]);

  // Check if inputs are valid
  const isSwapValid = () => {
    if (isReversed) {
      return selectedNFTs.length > 0; // Valid if NFTs are selected
    } else {
      return tshotAmount > 0 && tshotAmount <= parseFloat(tshotBalance); // Valid if amount is correct
    }
  };

  // Handle NFT Moment Type selection
  const handleNftTypeSelection = (e) => {
    const value = e.target.value;
    setSelectedNftType(value);

    // Automatically set the token based on the NFT selection
    if (value === "TopShot - Common") {
      setSelectedToken("$TSHOT - TopShot Common");
    } else if (value === "TopShot - Fandom") {
      setSelectedToken("$TFANDOM - TopShot Fandom");
    } else if (value === "TopShot - Rare") {
      setSelectedToken("$TRARE - TopShot Rare");
    } else if (value === "TopShot - Legendary") {
      setSelectedToken("$TLEGO - TopShot Legendary");
    } else if (value === "AllDay - Common") {
      setSelectedToken("$ADCOM - AllDay Common");
    } else if (value === "AllDay - Uncommon") {
      setSelectedToken("$ADUNCOM - AllDay Uncommon");
    } else if (value === "AllDay - Rare") {
      setSelectedToken("$ADRARE - AllDay Rare");
    } else if (value === "AllDay - Legendary") {
      setSelectedToken("$ADLEGO - AllDay Legendary");
    }
  };

  // Handle Token selection for FT to NFT swap
  const handleTokenSelection = (e) => {
    const value = e.target.value;
    setSelectedToken(value);

    // Auto-select the corresponding NFT type based on the token selected
    if (value === "$TSHOT - TopShot Common") {
      setSelectedNftType("TopShot - Common");
    } else if (value === "$TFANDOM - TopShot Fandom") {
      setSelectedNftType("TopShot - Fandom");
    } else if (value === "$TRARE - TopShot Rare") {
      setSelectedNftType("TopShot - Rare");
    } else if (value === "$TLEGO - TopShot Legendary") {
      setSelectedNftType("TopShot - Legendary");
    } else if (value === "$ADCOM - AllDay Common") {
      setSelectedNftType("AllDay - Common");
    } else if (value === "$ADUNCOM - AllDay Uncommon") {
      setSelectedNftType("AllDay - Uncommon");
    } else if (value === "$ADRARE - AllDay Rare") {
      setSelectedNftType("AllDay - Rare");
    } else if (value === "$ADLEGO - AllDay Legendary") {
      setSelectedNftType("AllDay - Legendary");
    }
  };

  // Handle mode switch when clicking on either option at the top
  const switchMode = (mode) => {
    if (
      (mode === "NFTtoFT" && isReversed === false) ||
      (mode === "FTtoNFT" && isReversed === true)
    ) {
      setIsReversed(!isReversed);
    }
  };

  return (
    <div className="w-full mx-auto bg-gray-800 p-6 rounded-lg shadow-xl font-inter max-w-screen-lg mt-24">
      <div className="flex justify-center space-x-8 mb-6">
        {/* Toggle between the two modes */}
        <div
          onClick={() => switchMode("NFTtoFT")}
          className={`cursor-pointer flex items-center justify-center p-4 text-center rounded-lg ${
            isReversed ? "border-4 border-green-500" : "border border-gray-600"
          } bg-gray-700 text-white hover:bg-gray-600`}
        >
          Moments → Tokens
        </div>
        <div
          onClick={() => switchMode("FTtoNFT")}
          className={`cursor-pointer flex items-center justify-center p-4 text-center rounded-lg ${
            !isReversed ? "border-4 border-green-500" : "border border-gray-600"
          } bg-gray-700 text-white hover:bg-gray-600`}
        >
          Tokens → Moments
        </div>
      </div>

      {isReversed ? (
        <>
          {/* NFT to Token Swap Section */}
          <div className="border-2 border-gray-700 p-4 rounded-lg mb-6">
            <label className="block text-gray-400 mb-2">Moment Type</label>
            <div className="flex justify-between items-center">
              <select
                value={selectedNftType}
                onChange={handleNftTypeSelection}
                className="w-1/2 p-3 mt-2 border rounded-lg text-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="TopShot - Common">TopShot - Common</option>
                <option value="TopShot - Fandom">TopShot - Fandom</option>
                <option value="TopShot - Rare">TopShot - Rare</option>
                <option value="TopShot - Legendary">TopShot - Legendary</option>
                <option value="AllDay - Common">AllDay - Common</option>
                <option value="AllDay - Uncommon">AllDay - Uncommon</option>
                <option value="AllDay - Rare">AllDay - Rare</option>
                <option value="AllDay - Legendary">AllDay - Legendary</option>
              </select>
              {selectedNftType && (
                <span className="text-gray-400 ml-2">
                  Balance: {nftDetails.length} Moments
                </span>
              )}
            </div>

            {/* Show Selected Moments */}
            {selectedNftType && (
              <div className="border p-3 mt-2 rounded-lg bg-gray-700 text-white">
                <p className="font-medium">Select Moments:</p>
                <div className="flex flex-wrap mt-3">
                  {nftDetails.length > 0 ? (
                    nftDetails.map((nft) => (
                      <MomentCard
                        key={nft.id}
                        nft={nft}
                        playerName={playerData[nft.playID]} // Pass playerName from playerData
                        handleNFTSelection={handleNFTSelection}
                        isSelected={selectedNFTs.includes(nft.id)}
                        tier={tierData[nft.id]} // Pass tier information
                      />
                    ))
                  ) : (
                    <p>No moments found.</p>
                  )}
                </div>
                <p className="mt-2 text-lg text-white font-semibold">
                  {selectedNFTs.length || "0"} Moments Selected
                </p>
              </div>
            )}
          </div>

          {/* FT Swap Section */}
          <div className="mt-6 border-2 border-gray-700 p-4 rounded-lg">
            <div className="text-lg text-white">{selectedToken}</div>
            <span className="text-gray-400 block mt-2">
              You will receive: {selectedNFTs.length} Tokens
            </span>
            <span className="text-gray-400 block mt-2">
              Balance: {parseFloat(tshotBalance || 0).toFixed(1)} TSHOT
            </span>
          </div>
        </>
      ) : (
        // Token to NFT Swap Section
        <>
          <div className="border-2 border-gray-700 p-4 rounded-lg mb-6">
            <label className="block text-gray-400 mb-2">Token Type</label>
            <select
              value={selectedToken}
              onChange={handleTokenSelection}
              className="w-1/2 p-3 mt-2 border rounded-lg text-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="$TSHOT - TopShot Common">
                $TSHOT - TopShot Common
              </option>
              <option value="$TFANDOM - TopShot Fandom">
                $TFANDOM - TopShot Fandom
              </option>
              <option value="$TRARE - TopShot Rare">
                $TRARE - TopShot Rare
              </option>
              <option value="$TLEGO - TopShot Legendary">
                $TLEGO - TopShot Legendary
              </option>
              <option value="$ADCOM - AllDay Common">
                $ADCOM - AllDay Common
              </option>
              <option value="$ADUNCOM - AllDay Uncommon">
                $ADUNCOM - AllDay Uncommon
              </option>
              <option value="$ADRARE - AllDay Rare">
                $ADRARE - AllDay Rare
              </option>
              <option value="$ADLEGO - AllDay Legendary">
                $ADLEGO - AllDay Legendary
              </option>
            </select>
            <span className="text-gray-400 block mt-2">
              Balance: {parseFloat(tshotBalance || 0).toFixed(1)} TSHOT
            </span>
            <input
              type="number"
              value={tshotAmount || ""}
              onChange={handleTshotChange}
              className="w-full p-3 mt-2 border rounded-lg text-lg bg-gray-700 text-white"
            />
          </div>

          {/* NFT Selection Section */}
          <div className="mt-6 border-2 border-gray-700 p-4 rounded-lg">
            <div className="text-lg text-white">{selectedNftType}</div>
            <span className="text-gray-400 block mt-2">
              You will receive: {tshotAmount || "0"} Moments
            </span>
            <span className="text-gray-400 block mt-2">
              Current Balance: {nftDetails.length || "0"} Moments
            </span>
          </div>
        </>
      )}

      <button
        onClick={handleSwap}
        disabled={!isSwapValid()}
        className={`p-3 mt-6 text-lg rounded-lg font-bold ${
          isSwapValid()
            ? "bg-blue-500 text-white"
            : "bg-gray-500 text-gray-400 cursor-not-allowed"
        }`}
      >
        Swap
      </button>
    </div>
  );
};

export default ExchangePanel;
