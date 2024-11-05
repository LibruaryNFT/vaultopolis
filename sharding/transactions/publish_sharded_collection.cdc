import "TopShotShardedCollection"

transaction {

    prepare(acct: auth(Storage, Capabilities) &Account) {

        // Check if the Sharded Moment Collection exists in storage
        let collectionRef = acct.storage.borrow<&TopShotShardedCollection.ShardedCollection>(from: /storage/ShardedMomentCollection)
            ?? panic("Sharded Moment Collection does not exist in storage.")

        // Issue and publish a public capability for the Sharded Moment Collection
        acct.capabilities.publish(
            acct.capabilities.storage.issue<&TopShotShardedCollection.ShardedCollection>(/storage/ShardedMomentCollection),
            at: /public/MomentCollection
        )

        log("Successfully published the public capability for Sharded Moment Collection.")
    }

    execute {
        log("Publishing process for Sharded Moment Collection completed.")
    }
}
