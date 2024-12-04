import "TopShotShardedCollectionV2"

transaction {

    prepare(acct: auth(Capabilities) &Account) {

        // Check if the public capability for the Sharded Moment Collection exists
        if acct.capabilities.get<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection).check() {
            // Unpublish (unlink) the public capability for the Sharded Moment Collection
            acct.capabilities.unpublish(/public/MomentCollection)
            log("Successfully unlinked the public capability for ShardedMomentCollection.")
        } else {
            log("No public capability for ShardedMomentCollection found to unlink.")
        }
    }

    execute {
        log("Unlinking process for Sharded Moment Collection completed.")
    }
}
