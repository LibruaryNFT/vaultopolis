import "TopShot"
import "TopShotLocking"
import "TopShotShardedCollectionV2"

// A struct to hold all the relevant NFT fields
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let setID: UInt32
    access(all) let playID: UInt32
    access(all) let serialNumber: UInt32
    access(all) let isLocked: Bool
    access(all) let subeditionID: UInt32?

    init(
        id: UInt64,
        setID: UInt32,
        playID: UInt32,
        serialNumber: UInt32,
        isLocked: Bool,
        subeditionID: UInt32?
    ) {
        self.id = id
        self.setID = setID
        self.playID = playID
        self.serialNumber = serialNumber
        self.isLocked = isLocked
        self.subeditionID = subeditionID
    }
}

access(all) fun main(address: Address, targetIDs: [UInt64]): [NFTDetails] {
    // Get the account
    let account = getAccount(address)

    // Borrow the public capability for the *ShardedCollectionV2* vault
    let collectionRef = account
        .capabilities
        .borrow<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection)
        ?? panic("Could not borrow the ShardedCollection reference")

    var result: [NFTDetails] = []

    // Loop through the provided IDs in targetIDs
    for id in targetIDs {
        let nftRef = collectionRef.borrowMoment(id: id)
        if nftRef == nil {
            // Skip if the NFT doesn't exist
            continue
        }

        let nft = nftRef!
        let data = nft.data

        // Check lock status
        let isLocked = TopShotLocking.isLocked(nftRef: nft)

        // Read subedition if any
        let subID = TopShot.getMomentsSubedition(nftID: id)  // returns UInt32?

        // Build our NFTDetails struct
        let details = NFTDetails(
            id: nft.id,
            setID: data.setID,
            playID: data.playID,
            serialNumber: data.serialNumber,
            isLocked: isLocked,
            subeditionID: subID
        )
        result.append(details)
    }

    return result
}
