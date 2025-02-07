import "TopShot"
import "TopShotLocking"

// Structure to hold the NFT details with additional fields
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let isLocked: Bool

    init(
        id: UInt64,
        isLocked: Bool
    ) {
        self.id = id
        self.isLocked = isLocked
    }
}

access(all) fun main(address: Address): [NFTDetails] {
    let account = getAccount(address)

    // Check if the public capability for the collection exists
    let collectionCap = account
        .capabilities
        .get<&TopShot.Collection>(/public/MomentCollection)
        .check()

    // If the capability does not exist, return an empty array
    if !collectionCap {
        return []
    }

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)

    // If the collection reference does not exist, return an empty array
    if collectionRef == nil {
        return []
    }

    // Get all NFT IDs in the collection
    let nftIDs = collectionRef!.getIDs()

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the NFT IDs, get metadata, tier, seriesID, etc.
    for id in nftIDs {
        let nftRef = collectionRef!.borrowMoment(id: id)
            ?? panic("Could not borrow the TopShot NFT")

        let data = nftRef.data

        // Get isLocked status
        let isLocked = TopShotLocking.isLocked(nftRef: nftRef)

        // Collect the details
        let nftDetails = NFTDetails(
            id: nftRef.id,
            isLocked: isLocked
        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    // Return the array of NFT details
    return nftDetailsList
}
