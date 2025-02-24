import "TopShotShardedCollectionV2"

// This script retrieves the list of moment IDs in a specific shard of the sharded collection
// owned by the specified account.
//
// Parameters:
// - account: The Flow Address of the account whose sharded collection data needs to be read.
// - shardIndex: The index of the shard to retrieve moment IDs from.
//
// Returns: [UInt64]
// List of all moment IDs in the specified shard of the sharded collection.

access(all) fun main(account: Address, shardIndex: UInt64): [UInt64] {
    let acct = getAccount(account)

    // Borrow the public capability for the ShardedCollection
    let shardedCollectionRef = acct
        .capabilities
        .get<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection)
        .borrow()
        ?? panic("Could not borrow the ShardedCollection reference")

    // Retrieve the list of moment IDs for the specified shard
    let momentIDs = shardedCollectionRef.getShardIDs(shardIndex: shardIndex)

    // Log the moment IDs for debugging
    log("Moment IDs in Shard")

    // Return the list of moment IDs
    return momentIDs
}

