export const bridgeEVM = `

import FlowEVMBridge from 0x1e4aa0b87d10b141
import FlowEVMBridgeConfig from 0x1e4aa0b87d10b141
import FlowEVMBridgeUtils from 0x1e4aa0b87d10b141
import EVM from 0xe467b9dd11fa00df

import FungibleToken from 0xf233dcee88fe0abe
import NonFungibleToken from 0x1d7e57aa55817448
import ScopedFTProviders from 0x1e4aa0b87d10b141

// Import TopShot contract
import TopShot from 0x0b2a3299cc857e29

/// Bridges multiple TopShot NFTs from Cadence to EVM in a batch with optimizations
/// Note: typeIdentifier is ignored since we hardcode TopShot
///
/// @param typeIdentifier: Ignored - hardcoded for TopShot (String format from frontend)
/// @param ids: An array of NFT IDs to bridge
///
transaction(typeIdentifier: String, ids: [UInt64]) {

    // Transaction fields
    let nftType: Type
    let requiresOnboarding: Bool
    let coa: auth(EVM.Call) &EVM.CadenceOwnedAccount
    let collection: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}
    let scopedProvider: @ScopedFTProviders.ScopedFTProvider

    prepare(signer: auth(BorrowValue, CopyValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        /* --- Reference the signer's CadenceOwnedAccount --- */
        //
        // Borrow the CadenceOwnedAccount from the signer's storage
        self.coa = signer.storage.borrow<auth(EVM.Call) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Could not borrow COA from provided account")

        // Assign the NFT type for TopShot
        self.nftType = Type<@TopShot.NFT>()
        
        // TopShot is already onboarded, so we can hardcode this
        self.requiresOnboarding = false

        /* --- Get TopShot Collection Directly --- */
        //
        // Hardcode TopShot collection path - skip expensive ViewResolver calls
        self.collection = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                from: /storage/MomentCollection
            ) ?? panic("Could not access TopShot Moment Collection")

        // Use fixed fee calculation for TopShot NFTs
        let approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000) + (FlowEVMBridgeConfig.baseFee * UFix64(ids.length))

        /* --- Configure a ScopedFTProvider --- */
        //
        // Issue and store bridge-dedicated Provider Capability in storage if necessary
        if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let providerCap = signer.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
                /storage/flowTokenVault
            )
            signer.storage.save(providerCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }
        // Copy the stored Provider capability and create a ScopedFTProvider
        let providerCapCopy = signer.storage.copy<Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>>(
                from: FlowEVMBridgeConfig.providerCapabilityStoragePath
            ) ?? panic("Invalid Provider Capability found in storage.")
        let providerFilter = ScopedFTProviders.AllowanceFilter(approxFee)
        self.scopedProvider <- ScopedFTProviders.createScopedFTProvider(
                provider: providerCapCopy,
                filters: [ providerFilter ],
                expiration: getCurrentBlock().timestamp + 1.0
        )
    }

    execute {
        // Use TopShot's batchWithdraw for potentially better gas efficiency
        let topShotCollection = self.collection as! auth(NonFungibleToken.Withdraw) &TopShot.Collection
        let withdrawnNFTs <- topShotCollection.batchWithdraw(ids: ids)
        
        // Bridge all NFTs from the batch collection
        let nftIDs = withdrawnNFTs.getIDs()
        for nftID in nftIDs {
            let nft <- withdrawnNFTs.withdraw(withdrawID: nftID)
            self.coa.depositNFT(
                nft: <- nft,
                feeProvider: &self.scopedProvider as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
        }

        // Clean up
        destroy withdrawnNFTs
        destroy self.scopedProvider
    }
}
`;
