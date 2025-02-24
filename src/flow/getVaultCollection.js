export const getVaultCollection = `

import TopShotShardedCollectionV2 from 0xb1788d64d512026d

// This script retrieves the total number of NFTs in the sharded collection
// owned by the specified account.
//
// Parameters:
// - account: The Flow Address of the account whose sharded collection data needs to be read.
//
// Returns: Int
// Total number of NFTs in the sharded collection.

access(all) fun main(account: Address): Int {

    let acct = getAccount(account)

    // Borrow the public capability for the ShardedCollection
    let shardedCollectionRef = acct
        .capabilities
        .get<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection)
        .borrow()
        ?? panic("Could not borrow the ShardedCollection reference")

    // Get and log the total number of moments
    let totalMoments = shardedCollectionRef.getLength()
    log("Total Moments: totalMoments")

    // Return the total count of NFTs
    return totalMoments
}


`;
