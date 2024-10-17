import "TopShot"

transaction {

    prepare(acct: auth(Capabilities) &Account) {

        // Check if the public capability for the Moment Collection exists
        if acct.capabilities.get<&TopShot.Collection>(/public/MomentCollection).check() {
            // Unpublish (unlink) the public capability for the Moment Collection
            acct.capabilities.unpublish(/public/MomentCollection)
            log("Successfully unlinked the public capability for MomentCollection.")
        } else {
            log("No public capability for MomentCollection found to unlink.")
        }
    }

    execute {
        log("Unlinking process completed.")
    }
}
