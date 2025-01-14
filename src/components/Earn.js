import React from "react";
import { ArrowRight, Repeat, CircleDollarSign, Gamepad } from "lucide-react";

const Earn = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Introduction */}
      <section className="mb-10 bg-gray-800 bg-opacity-75 p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Vaultopolis Protocol</h1>

        <p className="text-xl mb-6">
          Swap your common Top Shot moments for $TSHOT tokens (and back)
        </p>

        {/* What You Can Do With $TSHOT */}
        <div className="mb-6 bg-gray-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">
            What You Can Do With $TSHOT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Swap Back */}
            <div className="bg-gray-600 p-4 rounded-lg flex flex-col items-center text-center">
              <Repeat className="w-12 h-12 text-purple-400 mb-3" />
              <h4 className="font-semibold mb-2">Swap Back for Moments</h4>
              <p className="text-sm mb-4">
                Get random moments from the vault - chance for better ones
              </p>
              <a
                href="https://vaultopolis.com/vault"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-semibold w-full text-center"
              >
                View Vault
              </a>
            </div>

            {/* Earn Yield */}
            <div className="bg-gray-600 p-4 rounded-lg flex flex-col items-center text-center">
              <CircleDollarSign className="w-12 h-12 text-green-400 mb-3" />
              <h4 className="font-semibold mb-2">Earn Yield</h4>
              <p className="text-sm mb-4">
                Provide liquidity and stake for rewards
              </p>
              <div className="space-y-2 w-full">
                <a
                  href="https://app.increment.fi/liquidity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-semibold w-full"
                >
                  Increment.fi (Cadence)
                </a>
                <a
                  href="https://swap.kittypunch.xyz/?tab=liquidity&mode=add"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-semibold w-full"
                >
                  KittyPunch (EVM)
                </a>
              </div>
            </div>

            {/* Gaming */}
            <div className="bg-gray-600 p-4 rounded-lg flex flex-col items-center text-center">
              <Gamepad className="w-12 h-12 text-yellow-400 mb-3" />
              <h4 className="font-semibold mb-2">Gaming</h4>
              <p className="text-sm">
                Use in games and more utilities coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Rest of the content remains the same */}
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2">Fully Backed Tokens</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                $TSHOT tokens are only minted when moments are deposited into
                the vault
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                1:1 ratio - each token represents one moment in the vault
              </li>
            </ul>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2">Swap Back to Moments</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                Swap your $TSHOT back for random moments from the vault anytime
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                Uses verifiable onchain randomness for fair selection
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                Chance to receive better moments than you deposited
              </li>
            </ul>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2">Protocol Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                No fees for swapping
              </li>
              <li className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-green-400" />
                Automatic and instant swaps
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Earn;
