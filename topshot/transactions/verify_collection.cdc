import "TopShot"

transaction {

    prepare(acct: auth(BorrowValue) &Account) {
        // Check if the collection exists in storage
        let collectionRef = acct
            .storage
            .borrow<&TopShot.Collection>(from: /storage/MomentCollection)

        // If the collection reference does not exist, log an error and return false
        if collectionRef == nil {
            log("Collection reference not found in storage")
            return
        }

        // Check if the public capability for the collection exists
        let collectionCap = acct
            .capabilities
            .get<&TopShot.Collection>(/public/MomentCollection)
            .borrow()

        // If the capability does not exist, log an error and return false
        if collectionCap == nil {
            log("Public capability for collection not found")
            return
        }

        log("Collection and capability are set up correctly")
    }

    execute {
        log("Verification completed")
    }
}
