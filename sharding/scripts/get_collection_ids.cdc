import "TopShotShardedCollectionWrapper"

// This script retrieves a list of all moment IDs from the wrapped sharded collection
// owned by the specified account.

// Parameters:
// account: The Flow Address of the account whose wrapped sharded collection data needs to be read

// Returns: [UInt64]
// List of all moment IDs in the wrapped sharded collection

access(all) fun main(account: Address): [UInt64] {

    let acct = getAccount(account)

    // Borrow the wrapper's public capability
    let wrapperRef = acct.capabilities.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(/public/ShardedCollectionWrapper)
        ?? panic("Could not borrow the collection wrapper reference")

    // Get and log the moment IDs from the wrapper
    let momentIDs = wrapperRef.getIDs()
    log(momentIDs)

    // Return the list of moment IDs
    return momentIDs
}
