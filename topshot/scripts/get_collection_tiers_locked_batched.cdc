import "TopShot"
import "TopShotLocking"
import "TopShotTiers"

// Structure to map an NFT id to its tier and locked status.
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let tier: String
    access(all) let isLocked: Bool

    init(
        id: UInt64,
        tier: String,
        isLocked: Bool
    ) {
        self.id = id
        self.tier = tier
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
        
        // Get the tier using TopShotTiers.
        let tier = TopShotTiers.getTier(nft: nftRef)
        let tierString = tier != nil ? TopShotTiers.tierToString(tier: tier!) : ""
        
        // Check for the locked status using TopShotLocking.
        let lockedStatus = TopShotLocking.isLocked(nftRef: nftRef)
        
        nftDetailsList.append(
            NFTDetails(
                id: id,
                tier: tierString,
                isLocked: lockedStatus
            )
        )
    }
    
    return nftDetailsList
}
