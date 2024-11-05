import "TopShotShardedCollectionWrapper"
import "TopShot"

// This script retrieves a reference to a specific moment by ID from the wrapped sharded collection
// owned by the specified account.

// Parameters:
// account: The Flow Address of the account whose wrapped sharded collection data needs to be read
// momentID: The ID of the moment to retrieve

// Returns: &TopShot.NFT?
// A reference to the specified moment, or nil if it does not exist

access(all) fun main(account: Address, momentID: UInt64): &TopShot.NFT? {

    let acct = getAccount(account)

    // Borrow the wrapper's public capability
    let wrapperRef = acct.capabilities.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(/public/ShardedCollectionWrapper)
        ?? panic("Could not borrow the collection wrapper reference")

    // Get and log the moment details by ID
    let momentRef = wrapperRef.borrowMoment(id: momentID)
    log(momentRef)

    // Return the reference to the moment
    return momentRef
}
