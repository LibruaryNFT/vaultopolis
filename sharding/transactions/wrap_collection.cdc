import "TopShotShardedCollection"
import "TopShotShardedCollectionWrapper"

transaction {

    prepare(acct: auth(Storage, Capabilities) &Account) {

        // Check if the sharded collection exists in storage
        let collectionRef = acct.storage.borrow<&TopShotShardedCollection.ShardedCollection>(from: /storage/ShardedMomentCollection)
            ?? panic("Sharded Collection does not exist!")

        let collectionCap = acct.capabilities.get<&TopShotShardedCollection.ShardedCollection>(/public/MomentCollection)
        
        // Check that the capability is valid
        if !collectionCap.check() {
            panic("The ShardedCollection capability is invalid.")
        }

        // Create the wrapper resource using the collection capability
        let wrapper <- TopShotShardedCollectionWrapper.createWrapper(collectionCap: collectionCap)

        // Store the wrapper in the account storage
        acct.storage.save(<-wrapper, to: /storage/ShardedCollectionWrapper)

        // Issue the capability for the wrapper stored in the account
        let wrapperCap = acct.capabilities.storage.issue<&TopShotShardedCollectionWrapper.CollectionWrapper>(/storage/ShardedCollectionWrapper)

        // Publish the public capability for the wrapper
        acct.capabilities.publish(wrapperCap, at: /public/ShardedCollectionWrapper)
        
        log("Successfully created and stored the collection wrapper.")
    }

    execute {
        log("Wrapper setup and capability publishing complete.")
    }
}
