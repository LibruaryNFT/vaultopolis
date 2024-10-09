import "NonFungibleToken"
import "TopShot"
import "HybridCustody"

// Structure to hold only the NFT ID
access(all) struct NFTID {
    access(all) let id: UInt64

    init(id: UInt64) {
        self.id = id
    }
}

// Function to get NFT IDs from a specific address
access(all) fun getNFTsFromAddress(address: Address): [NFTID] {
    let account = getAccount(address)

    // Borrow the TopShot collection reference
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)

    // If the collection doesn't exist, return an empty array
    if collectionRef == nil {
        return []
    }

    // Get all NFT IDs in the collection
    let nftIDs = collectionRef!.getIDs()

    // Array to hold the NFT IDs
    var nftIDList: [NFTID] = []

    // Loop through the NFT IDs and append them to the list
    for id in nftIDs {
        // Borrow a reference to the Moment (TopShot NFT)
        let nftRef = collectionRef!.borrowMoment(id: id)
            ?? panic("Could not borrow a reference to the Moment")

        // Collect the ID
        let nftID = NFTID(id: nftRef.id)

        // Append to the array
        nftIDList.append(nftID)
    }

    return nftIDList
}

// Main function to get NFTs from both the parent and its child accounts
access(all) fun main(address: Address): [NFTID] {
    // Array to hold all NFTs (from parent and children)
    var allNftIDs: [NFTID] = []

    // Get NFTs from the parent account
    let parentNFTs = getNFTsFromAddress(address: address)
    allNftIDs.appendAll(parentNFTs)

    // Get the child addresses from the parent
    let acct = getAuthAccount<auth(Storage) &Account>(address)
    let manager = 
        acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("Manager not found")

    let childAddresses = manager.getChildAddresses()

    // Loop through child addresses and get their NFTs
    for childAddress in childAddresses {
        let childNFTs = getNFTsFromAddress(address: childAddress)
        allNftIDs.appendAll(childNFTs)
    }

    // Return all NFT IDs
    return allNftIDs
}
