import "TopShotShardedCollectionV2"
import "TopShot"

// This script retrieves a reference to a specific moment by ID from the sharded collection
// owned by the specified account.
//
// Parameters:
// - account: The Flow Address of the account whose sharded collection data needs to be read.
// - momentID: The ID of the moment to retrieve.
//
// Returns: &TopShot.NFT? A reference to the specified moment, or nil if it does not exist.

access(all) fun main(account: Address, momentID: UInt64): &TopShot.NFT? {
    // Get the account's public object
    let acct = getAccount(account)

    // Borrow the public capability for the ShardedCollection
    let shardedCollectionRef = acct
        .capabilities
        .get<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection)
        .borrow()
        ?? panic("Could not borrow the ShardedCollection reference")

    // Calculate the shard (bucket) where the momentID is stored
    let numBuckets = shardedCollectionRef.getNumBuckets()
    let shardIndex = momentID % numBuckets

    // Log the shard index for debugging
    log("Shard Index: shardIndex")

    // Use the reference to retrieve the moment by ID
    let momentRef = shardedCollectionRef.borrowMoment(id: momentID)

    // Log the moment reference for debugging
    log("Moment Reference: momentRef")

    // Return the moment reference
    return momentRef
}
