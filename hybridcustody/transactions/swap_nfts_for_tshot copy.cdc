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
    //let provider: &{NonFungibleToken.Provider}
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

        // Step 4: Access child NFT provider capability 

        var type = Type<&{NonFungibleToken.Provider}>()
        var controllerId = childAccount.getControllerIDForType(type: type, forPath: /storage/MomentCollection)
            ?? panic("no controller ID found for desired type")

        let nakedProviderCap = childAccount.getCapability(controllerID: controllerId, type: type)
            ?? panic("capability not found")

        let providerCap = nakedProviderCap as! Capability<&{NonFungibleToken.Provider}>
        assert(providerCap.check(), message: "invalid provider capability")

    if let provider = providerCap.borrow() as? auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider} {
        self.provider = provider
    } else {
        panic("unable to borrow nft provider collection")
    }

        // Step 5: Access child Public Collection
        var typeCollection = Type<&{NonFungibleToken.CollectionPublic}>()
    var controllerIdCollection = childAccount.getControllerIDForType(type: typeCollection, forPath: /storage/MomentCollection)
        ?? panic("no controller ID found for desired type")

    let nakedCapCollection = childAccount.getCapability(controllerID: controllerId, type: typeCollection)
        ?? panic("capability not found")

    let capCollection = nakedCapCollection as! Capability<&{NonFungibleToken.CollectionPublic}>
    capCollection.borrow() ?? panic("unable to borrow nft provider collection") 

        // Step 6: Initialize the receiver from the parent's storage
        self.receiver = signer.storage
            .borrow<&{NonFungibleToken.Collection}>(from: self.parentStoragePath)
            ?? panic("Could not borrow parent's NFT collection")

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

