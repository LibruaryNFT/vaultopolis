import "TopShotShardedCollectionWrapper"

// This script retrieves the total number of NFTs in the wrapped sharded collection
// owned by the specified account.

// Parameters:
// account: The Flow Address of the account whose wrapped sharded collection data needs to be read

// Returns: Int
// Total number of NFTs in the wrapped sharded collection

access(all) fun main(account: Address): Int {

    let acct = getAccount(account)

    // Borrow the wrapper's public capability
    let wrapperRef = acct.capabilities.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(/public/ShardedCollectionWrapper)
        ?? panic("Could not borrow the collection wrapper reference")

    // Get and log the total number of moments
    let totalMoments = wrapperRef.getLength()
    log(totalMoments)

    // Return the total count of NFTs
    return totalMoments
}
