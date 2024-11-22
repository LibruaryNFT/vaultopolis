import "TopShotShardedCollectionWrapper"

// This script retrieves all shard IDs (bucket indices) in the sharded collection of a given account

// Parameters:
// account: The Flow Address of the account whose sharded collection data needs to be read

// Returns: [UInt64]
// An array of shard IDs (bucket indices)

access(all) fun main(account: Address): [UInt64] {
    let acct = getAccount(account)

    // Borrow the wrapper's public capability
    let wrapperRef = acct.capabilities.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(/public/ShardedCollectionWrapper)
        ?? panic("Could not borrow the collection wrapper reference")

    // Get the total number of shards (buckets) in the sharded collection
    let numShards = wrapperRef.getNumBuckets()

    // Initialize an array to hold the shard IDs
    var shardIDs: [UInt64] = []

    // Populate the shard IDs array
    var shardIndex: UInt64 = 0
    while shardIndex < numShards {
        shardIDs.append(shardIndex)
        shardIndex = shardIndex + 1
    }

    // Return the array of shard IDs
    return shardIDs
}
