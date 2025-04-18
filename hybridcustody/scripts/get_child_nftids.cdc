import "HybridCustody"
import "NonFungibleToken"

// This script retrieves NFT IDs for TopShot collections located at /storage/MomentCollection
// from a parent's child accounts.
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

        // Access the TopShot MomentCollection directly at /storage/MomentCollection
        let path = /storage/MomentCollection
        if let collection = childAccount.storage.borrow<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(from: path) {
            log("TopShot MomentCollection found in child account: ".concat(childAddress.toString()))
            // Collect NFT IDs
            nftIDs.appendAll(collection.getIDs())
        }

        if nftIDs.length > 0 {
            childNFTs[childAddress] = nftIDs
        }
    }

    return childNFTs
}
