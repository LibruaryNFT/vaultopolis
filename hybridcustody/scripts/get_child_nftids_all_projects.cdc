// likely works but it has some contracts that werent upgraded, so may need to blacklist some nft projects

import "HybridCustody"
import "NonFungibleToken"

// This script iterates through a parent's child accounts
// and retrieves NFT IDs for accounts with accessible NonFungibleToken.Provider capabilities.
access(all) fun main(parent: Address): {Address: [UInt64]} {
    let manager = getAuthAccount<auth(Storage) &Account>(parent)
        .storage
        .borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(
            from: HybridCustody.ManagerStoragePath
        ) ?? panic("Manager does not exist")

    var childNFTs: {Address: [UInt64]} = {}

    // Iterate through all child accounts
    for childAddress in manager.getChildAddresses() {
        log("Inspecting child account: ".concat(childAddress.toString()))
        let childAccount = getAuthAccount<auth(Storage, Capabilities) &Account>(childAddress)
        let childAcctCap = manager.borrowAccount(addr: childAddress) ?? panic("Child account not found")
        var nftIDs: [UInt64] = []

        // Check storage paths for matching resources
        for path in childAccount.storage.storagePaths {
            let resourceType = childAccount.storage.type(at: path)
            let resourceTypeString = resourceType?.identifier ?? "Unknown"
            log("Path: ".concat(path.toString()).concat(", Type: ").concat(resourceTypeString))

            // Ensure the resource is of the expected type
            if resourceType != nil && resourceType!.isSubtype(of: Type<@{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>()) {
                if let collection = childAccount.storage.borrow<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(from: path) {
                    // Collect NFT IDs
                    nftIDs.appendAll(collection.getIDs())
                }
            }
        }

        if nftIDs.length > 0 {
            childNFTs[childAddress] = nftIDs
        }
    }

    return childNFTs
}
