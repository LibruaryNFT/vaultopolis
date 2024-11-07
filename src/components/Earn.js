import React from "react";
import { Link } from "react-router-dom";
import {
  FaExchangeAlt,
  FaWallet,
  FaSeedling,
  FaCoins,
  FaGift,
  FaGem,
} from "react-icons/fa";

const Earn = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      {/* Introduction to $TSHOT */}
      <section className="mb-10 bg-gray-800 bg-opacity-75 p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">What is $TSHOT?</h1>
        <p className="text-lg">
          $TSHOT is a unique token within the Increment.fi ecosystem that
          unlocks various earning opportunities and gamified features. Holders
          can stake and provide liquidity to earn rewards or explore swapping
          options for exclusive NFTs.
        </p>
      </section>

      {/* NFT to $TSHOT and $TSHOT to NFT Swapping Section */}
      <section className="mb-12 bg-gray-800 bg-opacity-75 p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">NFT & $TSHOT Swapping</h2>
        <div className="flex flex-col md:flex-row items-center md:space-x-8 space-y-8 md:space-y-0">
          {/* Swapping NFTs for $TSHOT */}
          <div className="bg-gray-700 p-6 rounded-lg text-center flex-1">
            <FaGift className="text-pink-400 text-5xl mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              Swap NFTs for $TSHOT
            </h3>
            <p>
              Trade your NFTs to receive $TSHOT, which can be used for earning
              through liquidity and staking, or swapped back for other NFTs with
              potential rare finds.
            </p>
          </div>

          <div className="text-center text-4xl text-gray-500">⇄</div>

          {/* Swapping $TSHOT for NFTs */}
          <div className="bg-gray-700 p-6 rounded-lg text-center flex-1">
            <FaGem className="text-yellow-400 text-5xl mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              Swap $TSHOT for NFTs
            </h3>
            <p>
              Use $TSHOT to redeem random NFTs from our vault. Some of these
              NFTs might be rare "grails," offering greater value than the
              initial swaps. Explore the vault contents at{" "}
              <a
                href="https://momentswap.xyz/vault"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                momentswap.xyz/vault
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Earn with $TSHOT Section */}
      <section className="mb-12 bg-gray-800 bg-opacity-75 p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">Earn Rewards with $TSHOT</h2>
        <p className="text-lg mb-6">
          Maximize your earnings by providing liquidity and staking on
          Increment.fi. Follow these simple steps to start earning rewards with
          your $TSHOT tokens.
        </p>

        {/* Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 1 */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <FaExchangeAlt className="text-blue-400 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold">
                1. Swap $TSHOT for FLOW (Optional)
              </h3>
            </div>
            <p>
              If you need FLOW tokens for liquidity or fees, swap $TSHOT for
              FLOW on Increment.fi. This step is optional.
            </p>
            <div className="mt-4">
              <a
                href="https://app.increment.fi/swap"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
              >
                Swap on Increment.fi
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <FaWallet className="text-green-400 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold">2. Add Liquidity</h3>
            </div>
            <p>
              Add liquidity by depositing $TSHOT, FLOW, or both to the pool on
              Increment.fi. Single-asset addition is supported.
            </p>
            <div className="mt-4">
              <a
                href="https://app.increment.fi/liquidity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded"
              >
                Add Liquidity
              </a>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <FaSeedling className="text-purple-400 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold">3. Stake LP Tokens</h3>
            </div>
            <p>
              After adding liquidity, stake your LP tokens on Increment.fi to
              start earning rewards.
            </p>
            <div className="mt-4">
              <a
                href="https://app.increment.fi/farm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded"
              >
                Stake LP Tokens
              </a>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <FaCoins className="text-yellow-400 text-3xl mr-4" />
              <h3 className="text-2xl font-semibold">4. Earn Rewards</h3>
            </div>
            <p>
              Track and claim your rewards on Increment.fi as they accumulate.
            </p>
            <div className="mt-4">
              <a
                href="https://app.increment.fi/farm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded"
              >
                View Your Rewards
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-12 bg-gray-800 bg-opacity-75 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          {/* FAQ 1 */}
          <div>
            <h3 className="font-semibold text-xl mb-2">
              What is Increment.fi?
            </h3>
            <p>
              Increment.fi is a decentralized platform on the Flow blockchain
              where you can swap tokens, provide liquidity, and earn rewards
              through staking.
            </p>
          </div>
          {/* FAQ 2 */}
          <div>
            <h3 className="font-semibold text-xl mb-2">
              Do I need to swap $TSHOT for FLOW?
            </h3>
            <p>
              Swapping $TSHOT for FLOW is optional. You can provide liquidity
              using $TSHOT, FLOW, or both. However, you may need FLOW tokens for
              transaction fees on the Flow blockchain.
            </p>
          </div>
          {/* FAQ 3 */}
          <div>
            <h3 className="font-semibold text-xl mb-2">
              How do I add liquidity?
            </h3>
            <p>
              Visit the <strong>Add Liquidity</strong> page on Increment.fi,
              select the tokens you want to add, and follow the prompts to
              confirm the transaction.
            </p>
          </div>
          {/* FAQ 4 */}
          <div>
            <h3 className="font-semibold text-xl mb-2">
              How do I stake my LP tokens?
            </h3>
            <p>
              After adding liquidity, go to the <strong>Farm</strong> page on
              Increment.fi. Select the LP tokens you received and stake them to
              start earning rewards.
            </p>
          </div>
          {/* FAQ 5 */}
          <div>
            <h3 className="font-semibold text-xl mb-2">
              Can I unstake my tokens?
            </h3>
            <p>
              Yes, you can unstake your tokens at any time. Keep in mind that
              rewards accumulate over time, so longer staking periods may yield
              more rewards.
            </p>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="mb-12 bg-gray-800 bg-opacity-75 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-6">Need Help?</h2>
        <p>
          If you have any questions or need assistance, feel free to join our{" "}
          <a
            href="https://discord.gg/AwaNfedhgK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Discord community
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default Earn;
