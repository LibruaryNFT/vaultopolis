import "TopShotShardedCollectionWrapper"

transaction {

    prepare(acct: auth(Storage, Capabilities) &Account) {
        
        // Check if the CollectionWrapper exists in storage
        let wrapperRef = acct.storage.borrow<&TopShotShardedCollectionWrapper.CollectionWrapper>(from: /storage/ShardedCollectionWrapper)
            ?? panic("CollectionWrapper does not exist!")

        // Unpublish the public capability for the CollectionWrapper
        acct.capabilities.unpublish(/public/ShardedCollectionWrapper)

        // Remove and destroy the wrapper from storage
        let wrapper <- acct.storage.load<@TopShotShardedCollectionWrapper.CollectionWrapper>(from: /storage/ShardedCollectionWrapper)
            ?? panic("Failed to load CollectionWrapper from storage")
        destroy wrapper

        log("Successfully removed and destroyed the collection wrapper.")
    }

    execute {
        log("Unwrapping transaction complete.")
    }
}
