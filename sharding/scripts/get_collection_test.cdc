import "TopShot"
import "TopShotShardedCollectionWrapper"

// Structure to hold the NFT details with additional fields
access(all) struct NFTDetails {
    access(all) let id: UInt64
    

    init(
        id: UInt64,
       
    ) {
        self.id = id
        
    }
}

access(all) fun main(account: Address): [NFTDetails] {
    let acct = getAccount(account)

    // Borrow the wrapper's public capability
    let wrapperRef = acct.capabilities.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(/public/ShardedCollectionWrapper)
        ?? panic("Could not borrow the collection wrapper reference")

    // Get all NFT IDs in the collection
    let nftIDs = wrapperRef.getIDs()

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the NFT IDs, get metadata, tier, seriesID, etc.
    for id in nftIDs {
        let nftRef = wrapperRef.borrowMoment(id: id)
            ?? panic("Could not borrow the TopShot NFT")

        let data = nftRef.data


        // Collect the details
        let nftDetails = NFTDetails(
            id: nftRef.id,
            
            
        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    // Return the array of NFT details
    return nftDetailsList
}
