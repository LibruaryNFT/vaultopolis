import "TopShotShardedCollectionV2"

// This script retrieves a list of all moment IDs from the sharded collection
// owned by the specified account.
//
// Parameters:
// - account: The Flow Address of the account whose sharded collection data needs to be read.
//
// Returns: [UInt64]
// List of all moment IDs in the sharded collection.

access(all) fun main(account: Address): [UInt64] {
    // Get the account's public object
    let acct = getAccount(account)

    // Borrow the public capability for the ShardedCollection
    let shardedCollectionRef = acct
        .capabilities
        .get<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection)
        .borrow()
        ?? panic("Could not borrow the ShardedCollection reference")

    // Get the total number of buckets (shards) in the collection
    let numBuckets = shardedCollectionRef.getNumBuckets()

    // Initialize an array to store all moment IDs
    var allMomentIDs: [UInt64] = []

    // Iterate through each shard to collect all IDs
    var i: UInt64 = 0
    while i < numBuckets {
        let shardIDs = shardedCollectionRef.getShardIDs(shardIndex: i)
        allMomentIDs.appendAll(shardIDs)
        i = i + 1
    }

    // Log the aggregated IDs for debugging
    log(allMomentIDs)

    // Return the complete list of moment IDs
    return allMomentIDs
}
