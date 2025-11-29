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
  dispatch,
  maxTSHOTAmount,
  onMaxClick,
  syncFiltersWithURL = false,
  searchParams = null,
  setSearchParams = null,
}) => {
  return (
    <div className="w-full text-white space-y-1.5 mb-2">
      <div className="space-y-1.5">
        {/* Swap Panel */}
        <div className="max-w-md mx-auto mt-2 space-y-2 w-full md:w-[400px]">
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
                {fromAsset === "TSHOT" && !isNFTMode && (
                  <button
                    onClick={onMaxClick}
                    disabled={maxTSHOTAmount <= 0}
                    className="text-xs bg-brand-accent hover:bg-brand-accent/80 disabled:bg-brand-accent/30 disabled:cursor-not-allowed disabled:opacity-50 text-white px-2 py-1 rounded mt-1 text-center transition-colors"
                  >
                    Max
                  </button>
                )}
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
                      <div className="flex flex-col leading-tight">
                        <span>TopShot Moments</span>
                        <span className="text-xs text-brand-text/70 mt-0.5">
                          <span className="text-gray-400">Common</span> and{" "}
                          <span className="text-lime-400">Fandom</span>
                        </span>
                      </div>
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
          <div className="w-full p-0 space-y-0 mb-1.5">
              {/* Filter Section - Single background for Collection + all filters */}
              <div className="bg-brand-primary rounded pt-1.5 pb-0 px-1 -mx-1">
                {/* Account Selection (left-aligned, not full width) */}
                <div className="px-2 py-1 pt-1.5 flex flex-wrap gap-2 w-full">
                  <AccountSelection
                    parentAccount={{
                      addr: accountData?.parentAddress,
                      hasCollection: accountCollections[accountData?.parentAddress],
                    }}
                    childrenAddresses={childAddresses}
                    childrenAccounts={accountData?.childrenData || []}
                    selectedAccount={selectedAccount}
                    onSelectAccount={handleSelectAccount}
                    isLoadingChildren={isLoadingChildren}
                    requireCollection={true}
                    labelText="Collection:"
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

                {/* Moment Selection (full width) - filter sections only */}
                <div className="w-full">
                  <MomentSelection
                    // Exclude both manually excluded IDs and currently selected NFTs
                    excludeIds={[
                      ...excludedNftIds,
                      ...selectedNFTs.map((id) => String(id)),
                    ]}
                    restrictToCommonFandom={true}
                    syncFiltersWithURL={syncFiltersWithURL}
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                  />
                </div>
              </div>

              {/* Selected Moments - Collapsible */}
              <div
                className={`bg-brand-primary shadow-md w-full transition-all duration-300 overflow-hidden ${
                  selectedNFTs.length === 0 ? "h-14 border border-transparent" : "h-[280px] border-2 border-opolis"
                }`}
              >
                <div className="p-2 h-full flex flex-col">
                  {/* Header - Always visible */}
                  <div className="flex justify-between items-center flex-shrink-0 mb-2">
                    <h4 className="text-brand-text text-sm">Selected Moments:</h4>
                    <span className="text-brand-text/70 text-sm">
                      {selectedNFTs.length}/200
                    </span>
                  </div>

                  {/* Content - Conditional */}
                  {selectedNFTs.length === 0 ? (
                    // Empty state - minimal but "alive"
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-brand-text/50 text-xs">
                        No moments selected yet
                      </span>
                    </div>
                  ) : (
                    // Populated state - scrollable grid
                    <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,80px))] sm:grid-cols-[repeat(auto-fit,minmax(112px,112px))] gap-2 justify-items-center">
                        {selectedNFTs.map((momentId) => {
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
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ========== DUPLICATE SWAP ACTION PANEL ========== */}
              <div className="max-w-md mx-auto w-full md:w-[400px] mt-4 pt-2">
                <div>{renderSwapPanel()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default SwapApplication;