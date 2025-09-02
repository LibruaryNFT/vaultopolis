import React from "react";
import Dropdown, { FROM_OPTIONS } from "./Dropdown";
import { Info } from "lucide-react";
import * as fcl from "@onflow/fcl";
import { verifyTopShotCollection } from "../flow/verifyTopShotCollection";
import { setupTopShotCollection } from "../flow/setupTopShotCollection";
import MomentCard from "./MomentCard";
import AccountSelection from "./AccountSelection";
import MomentSelection from "./MomentSelection";

const SwapApplication = ({
  fromAsset,
  toAsset,
  fromInput,
  toInput,
  isOverMax,
  isOverNFTLimit,
  isNFTMode,
  dashboardMode,
  setFromAsset,
  setShowInfoModal,
  handleFromKeyDown,
  handleFromInputChange,
  toggleAssets,
  handleToKeyDown,
  handleToInputChange,
  renderFromBalance,
  renderToBalance,
  renderSwapPanel,
  accountData,
  selectedNFTs,
  selectedAccount,
  childAddresses,
  accountCollections,
  isLoadingChildren,
  excludedNftIds,
  handleSelectAccount,
  setAccountCollections,
  dispatch
}) => {
  return (
    <div className="w-full text-white space-y-2 mb-2">
      <div className="space-y-4">
        {/* Swap Panel */}
        <div className="max-w-md mx-auto mt-2 space-y-2 w-full md:w-[400px] mb-2">
          {/* Outer container => brand-primary with shadow */}
          <div className="p-2 rounded-lg bg-brand-primary shadow-md shadow-black/30">
            {/* FROM BOX => brand-secondary */}
            <div
              className="
                bg-brand-secondary
                p-2
                rounded-lg
                mb-2
                flex
                items-start
                justify-between
                min-h-[120px]
              "
            >
              <div className="mr-2 flex flex-col">
                <label className="block text-sm text-brand-text mb-1">
                  From
                </label>
                <div className="flex items-center">
                  <div className="w-[220px] h-14">
                    <Dropdown
                      options={FROM_OPTIONS}
                      selectedValue={fromAsset}
                      onChange={(val) => setFromAsset(val)}
                      excludeSelected={true}
                    />
                  </div>
                  {fromAsset === "TSHOT" && (
                    <button
                      onClick={() => setShowInfoModal(true)}
                      className="ml-2 p-1 hover:bg-brand-primary rounded-full transition-colors"
                      aria-label="Learn more about TSHOT"
                    >
                      <Info size={18} className="text-brand-text/70" />
                    </button>
                  )}
                </div>
                {renderFromBalance()}
              </div>

              <div className="flex flex-col w-[80px] ml-2">
                <label className="block text-sm text-brand-text mb-1 text-center">
                  Amount
                </label>
                <input
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  value={fromInput}
                  onKeyDown={handleFromKeyDown}
                  onChange={handleFromInputChange}
                  placeholder="0"
                  maxLength={3}
                  className={`w-full bg-brand-secondary text-brand-text px-1 py-2 rounded text-3xl text-center ${
                    isOverMax || isOverNFTLimit ? "border-2 border-red-400" : ""
                  }`}
                  readOnly={isNFTMode}
                />
                {isOverMax && fromAsset === "TSHOT" && (
                  <div className="text-red-400 text-xs mt-1">Max 50 TSHOT</div>
                )}
                {isOverNFTLimit && (
                  <div className="text-red-400 text-xs mt-1">Max 200 NFTs</div>
                )}
              </div>
            </div>

            {/* Exchange Icon + horizontal line => brand-primary button */}
            <div className="relative my-2 flex items-center justify-center">
              <hr className="absolute inset-x-0 border-t border-brand-text/50 opacity-30 top-1/2 -translate-y-1/2" />
              <button
                onClick={toggleAssets}
                className="
                  z-10
                  w-10
                  h-10
                  rounded-full
                  border
                  border-brand-text/30
                  bg-brand-primary
                  text-2xl
                  text-brand-text
                  flex
                  items-center
                  justify-center
                "
              >
                ⇅
              </button>
            </div>

            {/* TO BOX => brand-secondary */}
            <div
              className="
                bg-brand-secondary
                p-2
                rounded-lg
                flex
                items-start
                justify-between
                min-h-[120px]
              "
            >
              <div className="mr-2 flex flex-col">
                <label className="block text-sm text-brand-text mb-1">To</label>
                <div className="flex flex-nowrap items-center">
                  <div
                    className="
                      bg-brand-primary
                      text-brand-text
                      px-3
                      py-2
                      rounded-lg
                      text-base
                      w-[220px]
                      h-14
                      flex
                      items-center
                    "
                  >
                    {toAsset === "TSHOT" ? (
                      <div className="flex items-center gap-2">
                        <img
                          src="https://storage.googleapis.com/vaultopolis/TSHOT.png"
                          alt="TSHOT"
                          width="36"
                          height="36"
                          className="w-9 h-9"
                        />
                        <span>TSHOT</span>
                      </div>
                    ) : (
                      <span>
                        <span className="hidden sm:inline">TopShot</span>
                        <span className="sm:hidden">TS</span>{" "}
                        <span className="text-gray-400">Common</span> /{" "}
                        <span className="text-lime-400">Fandom</span>
                      </span>
                    )}
                  </div>
                  {toAsset === "TSHOT" && (
                    <button
                      onClick={() => setShowInfoModal(true)}
                      className="ml-2 p-1 hover:bg-brand-primary rounded-full transition-colors"
                      aria-label="Learn more about TSHOT"
                    >
                      <Info size={18} className="text-brand-text/70" />
                    </button>
                  )}
                </div>
                {renderToBalance()}
              </div>

              <div className="flex flex-col w-[80px] ml-2">
                <label className="block text-sm text-brand-text mb-1 text-center">
                  Amount
                </label>
                <input
                  type="text"
                  value={toInput}
                  onKeyDown={handleToKeyDown}
                  onChange={handleToInputChange}
                  placeholder="0"
                  maxLength={3}
                  className="w-full bg-brand-secondary text-brand-text px-1 py-2 rounded text-3xl text-center"
                  readOnly={
                    dashboardMode === "TSHOT_TO_NFT" ||
                    dashboardMode === "NFT_TO_TSHOT"
                  }
                />
              </div>
            </div>
          </div>

          {/* ========== SWAP ACTION PANEL ========== */}
          <div>{renderSwapPanel()}</div>
        </div>

        {/* Moment selection and account management - Only for logged-in users */}
        {fromAsset === "TopShot Common / Fandom" &&
          accountData?.parentAddress && (
            <div className="w-full p-0 space-y-2 mb-2">
              {/* Selected Moments (full width) */}
              <div className="bg-brand-primary shadow-md p-2 rounded w-full">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-brand-text text-sm">Selected Moments:</h4>
                  <span className="text-brand-text/70 text-sm">
                    {selectedNFTs.length}/50
                  </span>
                </div>
                <div className="h-[280px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-2 justify-items-center">
                    {selectedNFTs.length > 0 ? (
                      selectedNFTs.map((momentId) => {
                        const activeAcc =
                          (accountData.childrenData || []).find(
                            (c) => c.addr === selectedAccount
                          ) || accountData;
                        const nft = (activeAcc.nftDetails || []).find(
                          (item) => Number(item.id) === Number(momentId)
                        );
                        return (
                          <MomentCard
                            key={momentId}
                            nft={nft}
                            handleNFTSelection={() =>
                              dispatch({
                                type: "SET_SELECTED_NFTS",
                                payload: momentId,
                              })
                            }
                            isSelected={true}
                          />
                        );
                      })
                    ) : (
                      <span className="text-brand-text/70 col-span-full text-center">
                        No moments selected
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Selection (left-aligned, not full width) */}
              <div className="bg-brand-primary shadow-md px-1 py-2 rounded flex flex-wrap gap-2 w-full">
                <AccountSelection
                  parentAccount={{
                    addr: accountData?.parentAddress,
                    hasCollection: accountCollections[accountData?.parentAddress],
                  }}
                  childrenAddresses={childAddresses}
          selectedAccount={selectedAccount}
                  onSelectAccount={handleSelectAccount}
          isLoadingChildren={isLoadingChildren}
                  requireCollection={true}
                  onSetupTopShotCollection={async (address) => {
                    try {
                      const txId = await fcl.mutate({
                        cadence: setupTopShotCollection,
                        args: (arg, t) => [],
                        proposer: fcl.authz,
                        payer: fcl.authz,
                        authorizations: [fcl.authz],
                        limit: 9999,
                      });

                      // Wait for transaction to be sealed
                      await fcl.tx(txId).onceSealed();

                      // After successful setup, refresh the account data
                      if (accountData?.parentAddress) {
                        try {
                          const hasCollection = await fcl.query({
                            cadence: verifyTopShotCollection,
                            args: (arg, t) => [
                              arg(accountData.parentAddress, t.Address),
                            ],
                          });
                          setAccountCollections((prev) => ({
                            ...prev,
                            [accountData.parentAddress]: hasCollection,
                          }));
                        } catch (error) {
                          console.error(
                            "Error refreshing collection status:",
                            error
                          );
                        }
                      }
                    } catch (error) {
                      console.error("Failed to setup TopShot collection:", error);
                      throw error; // Re-throw to be handled by AccountSelection
                    }
                  }}
                  onRefreshParentAccount={async () => {
                    // Refresh the account collections
                    if (accountData?.parentAddress) {
                      try {
                        const hasCollection = await fcl.query({
                          cadence: verifyTopShotCollection,
                          args: (arg, t) => [
                            arg(accountData.parentAddress, t.Address),
                          ],
                        });
                        setAccountCollections((prev) => ({
                          ...prev,
                          [accountData.parentAddress]: hasCollection,
                        }));
                      } catch (error) {
                        console.error(
                          "Error refreshing collection status:",
                          error
                        );
                      }
                    }
                  }}
                />
              </div>

              {/* Moment Selection (full width) */}
              <div className="bg-brand-primary shadow-md rounded-lg w-full">
                <MomentSelection
                  excludeIds={excludedNftIds}
                  restrictToCommonFandom={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default SwapApplication;