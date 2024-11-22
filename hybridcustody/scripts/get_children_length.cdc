import "HybridCustody"
import "NonFungibleToken"

// This script retrieves the length of TopShot MomentCollection for each child account.
access(all) fun main(parent: Address): {Address: Int} {
    let manager = getAuthAccount<auth(Storage) &Account>(parent)
        .storage
        .borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(
            from: HybridCustody.ManagerStoragePath
        ) ?? panic("Manager does not exist")

    var childNFTCounts: {Address: Int} = {}

    // Iterate through all child accounts
    for childAddress in manager.getChildAddresses() {
        log("Inspecting child account: ".concat(childAddress.toString()))
        let childAccount = getAuthAccount<auth(Storage, Capabilities) &Account>(childAddress)
        let childAcctCap = manager.borrowAccount(addr: childAddress) ?? panic("Child account not found")

        // Access the TopShot MomentCollection directly at /storage/MomentCollection
        let path = /storage/MomentCollection
        if let collection = childAccount.storage.borrow<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(from: path) {
            log("TopShot MomentCollection found in child account: ".concat(childAddress.toString()))
            // Get the count of NFTs in the collection
            let nftCount = collection.getIDs().length
            childNFTCounts[childAddress] = nftCount
        } else {
            log("No MomentCollection found in child account: ".concat(childAddress.toString()))
            childNFTCounts[childAddress] = 0
        }
    }

    return childNFTCounts
}
