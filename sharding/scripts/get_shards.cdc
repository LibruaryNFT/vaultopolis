import "TopShotShardedCollectionWrapper"

// This script retrieves the number of buckets in the sharded collection
// and maps each bucket to the number of moments it contains.

// Parameters:
// account: The Flow Address of the account whose wrapped sharded collection data needs to be read

// Returns: {UInt64: Int}
// A dictionary mapping each bucket (shard) index to the number of moment IDs it contains

access(all) fun main(account: Address): {UInt64: Int} {
    let acct = getAccount(account)

    // Borrow the wrapper's public capability
    let wrapperRef = acct.capabilities.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(/public/ShardedCollectionWrapper)
        ?? panic("Could not borrow the collection wrapper reference")

    // Get the total number of buckets in the sharded collection
    let numBuckets = wrapperRef.getNumBuckets()

    // Initialize an empty dictionary to store the count of moments in each bucket
    var bucketMomentCounts: {UInt64: Int} = {}

    // Use a while loop to iterate over each bucket
    var bucketIndex: UInt64 = 0
    while bucketIndex < numBuckets {
        // Get the list of moment IDs in the current bucket
        let momentIDs = wrapperRef.getShardIDs(shardIndex: bucketIndex)
        
        // Store the count of moment IDs for the current bucket in the dictionary
        bucketMomentCounts[bucketIndex] = momentIDs.length

        // Increment the bucket index
        bucketIndex = bucketIndex + 1
    }

    // Return the dictionary mapping each bucket index to the count of its moments
    return bucketMomentCounts
}
