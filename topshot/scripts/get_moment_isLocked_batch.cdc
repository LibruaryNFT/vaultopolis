import "TopShot"
import "TopShotLocking"

// Structure to map an NFT id to its locked status.
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

access(all) fun main(account: Address, ids: [UInt64]): [NFTDetails] {
    // Borrow the user's collection using the public capability.
    let collectionRef = getAccount(account)
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)
        ?? panic("Could not get public moment collection reference")
    
    var nftDetailsList: [NFTDetails] = []
    
    // Loop through the provided NFT IDs.
    for id in ids {
        let nftRef = collectionRef.borrowMoment(id: id)
            ?? panic("Could not borrow NFT with id: ".concat(id.toString()))
        
        let lockedStatus = TopShotLocking.isLocked(nftRef: nftRef)
        
        nftDetailsList.append(
            NFTDetails(
                id: id,
                isLocked: lockedStatus
            )
        )
    }
    
    return nftDetailsList
}
