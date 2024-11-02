import React from "react";
import { FaSyncAlt, FaCoins, FaDice } from "react-icons/fa";

const SwapInfo = () => {
  return (
    <div className="bg-gray-700 bg-opacity-80 p-6 rounded-lg shadow-xl text-white mb-8">
      {/* Main Title */}
      <h2 className="text-2xl font-bold text-center mb-4">
        Get Rewards with Moment Swap: Swap, Stake, and Redeem Your Moments!
      </h2>

      {/* Combined Steps and Benefits Section */}
      <div className="flex flex-wrap justify-center items-stretch gap-4">
        {/* Step 1 */}
        <div className="bg-blue-900 p-4 rounded-md text-center w-56 flex-grow space-y-1">
          <span className="block text-3xl font-bold text-blue-300">1</span>
          <FaSyncAlt size={24} className="mx-auto text-blue-300 mb-1" />
          <h3 className="font-semibold text-md">Swap Moments for TSHOT</h3>
          <p className="text-gray-300 text-xs">
            Swap common TopShot moments for TSHOT tokens. TSHOT can be swapped
            back for random moments anytime.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-green-900 p-4 rounded-md text-center w-56 flex-grow space-y-1">
          <span className="block text-3xl font-bold text-green-300">2</span>
          <FaCoins size={24} className="mx-auto text-green-300 mb-1" />
          <h3 className="font-semibold text-md">Stake in Liquidity Pools</h3>
          <p className="text-gray-300 text-xs">
            Use TSHOT tokens in liquidity pools on Increment.fi to earn rewards.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-purple-900 p-4 rounded-md text-center w-56 flex-grow space-y-1">
          <span className="block text-3xl font-bold text-purple-300">3</span>
          <FaDice size={24} className="mx-auto text-purple-300 mb-1" />
          <h3 className="font-semibold text-md">
            Redeem for Random Moments Anytime
          </h3>
          <p className="text-gray-300 text-xs">
            Trade TSHOT back for a random common moment, with a chance to get a
            valuable moment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwapInfo;
