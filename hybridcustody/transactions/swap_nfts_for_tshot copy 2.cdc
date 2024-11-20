import "MomentSwapTSHOT"
import "NonFungibleToken"
import "TopShot"
import "FungibleToken"
import "TSHOT"
import "HybridCustody"

transaction(
    child: Address,
    nftIDs: [UInt64]
) {
    let signerAddress: Address
    let provider: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}
    let receiver: &{NonFungibleToken.Collection}
    let nfts: @[TopShot.NFT]

    // Declare paths as constants
    let parentStoragePath: StoragePath

    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Initialize paths
        self.parentStoragePath = StoragePath(identifier: "MomentCollection")!

        // Step 1: Get the signer's address
        self.signerAddress = signer.address

        // Step 2: Check if the signer has a TSHOT Vault and set it up if it doesn't exist
        if signer.storage.borrow<&TSHOT.Vault>(from: /storage/TSHOTTokenVault) == nil {
            let vault <- TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())
            signer.storage.save(<-vault, to: /storage/TSHOTTokenVault)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(/storage/TSHOTTokenVault),
                at: /public/TSHOTTokenReceiver
            )
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{FungibleToken.Balance}>(/storage/TSHOTTokenVault),
                at: /public/TSHOTTokenBalance
            )
            log("TSHOT Vault setup complete.")
        } else {
            log("TSHOT Vault already exists.")
        }

        // Step 3: Get the Hybrid Custody Manager and borrow the child account
        let manager = signer.storage
            .borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("Hybrid Custody Manager does not exist")
        let childAccount = manager.borrowAccount(addr: child)
            ?? panic("Child account not found")

        // Step 4: Access child NFT provider capability dynamically
        let providerType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
        var foundProviderCap: Capability<&{NonFungibleToken.Provider}>? = nil

        // Iterate over controller IDs to find a valid provider capability
        let controllerIDs = childAccount.getControllerIDs()
        for controllerID in controllerIDs {
            // Attempt to get the capability for the desired provider type
            if let cap = childAccount.getCapability(controllerID: controllerID, type: providerType) {
                if cap.check() {
                    foundProviderCap = cap as? Capability<&{NonFungibleToken.Provider}>
                    break
                }
            }
        }

        let providerCap = foundProviderCap ?? panic("No valid NFT provider capability found for the child account")

        // Borrow the capability to use it for withdrawing NFTs
        self.provider = providerCap.borrow() as? auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}
            ?? panic("Unable to borrow NFT provider collection from the child account")

        // Step 5: Access child Public Collection capability dynamically
        let collectionType = Type<&{NonFungibleToken.CollectionPublic}>()
        var foundCollectionCap: Capability<&{NonFungibleToken.CollectionPublic}>? = nil

        // Iterate over controller IDs to find a valid collection capability
        for controllerID in controllerIDs {
            // Attempt to get the capability for the desired collection type
            if let cap = childAccount.getCapability(controllerID: controllerID, type: collectionType) {
                if cap.check() {
                    foundCollectionCap = cap
                    break
                }
            }
        }

        let collectionCap = foundCollectionCap ?? panic("No valid NFT collection capability found for the child account")

        // Borrow the capability to confirm it can access the public collection
        let childCollection = collectionCap.borrow()
            ?? panic("Unable to borrow NFT public collection from the child account")

        // Step 6: Initialize the receiver from the parent's storage dynamically
        let collectionType = Type<&{NonFungibleToken.Collection}>()

        // Find the first valid storage path with the desired type
        var parentCollectionPath: StoragePath? = nil
        for path in signer.storage.storagePaths {
            if let storedType = signer.storage.type(at: path) {
                if storedType.isSubtype(of: collectionType) {
                    parentCollectionPath = path
                    break
                }
            }
        }

        // Ensure the path was found
        let validPath = parentCollectionPath ?? panic("Could not locate a valid NFT collection in the parent's storage")

        // Borrow the collection from the located path
        self.receiver = signer.storage.borrow<&{NonFungibleToken.Collection}>(from: validPath)
            ?? panic("Could not borrow parent's NFT collection from the located path")

        // Step 7: Withdraw NFTs from the child's collection
        self.nfts <- []
        for nftID in nftIDs {
            let nft <- self.provider.withdraw(withdrawID: nftID) as! @TopShot.NFT
            self.nfts.append(<-nft)
        }
    }

    execute {
        // Step 8: Call the MomentSwapTSHOT function to swap NFTs for $TSHOT
        MomentSwapTSHOT.swapNFTsForTSHOT(
            nftIDs: <-self.nfts,
            address: self.signerAddress
        )
        log("NFTs successfully swapped for $TSHOT.")
    }
}
