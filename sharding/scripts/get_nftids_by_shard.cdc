import "TopShotShardedCollectionWrapper"

// This script retrieves the list of moment IDs in a specific shard of the wrapped sharded collection
// owned by the specified account.

// Parameters:
// account: The Flow Address of the account whose wrapped sharded collection data needs to be read
// shardIndex: The index of the shard to retrieve moment IDs from

// Returns: [UInt64]
// List of all moment IDs in the specified shard of the wrapped sharded collection

access(all) fun main(account: Address, shardIndex: UInt64): [UInt64] {
    let acct = getAccount(account)

    // Borrow the wrapper's public capability
    let wrapperRef = acct.capabilities.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(/public/ShardedCollectionWrapper)
        ?? panic("Could not borrow the collection wrapper reference")

    // Retrieve the list of moment IDs for the specified shard
    let momentIDs = wrapperRef.getShardIDs(shardIndex: shardIndex)

    // Return the list of moment IDs
    return momentIDs
}
