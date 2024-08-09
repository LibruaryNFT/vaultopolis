import "TopShot"

transaction(recipient: Address, momentID: UInt64) {

    // The signer must have a collection in storage
    prepare(signer: auth(Withdraw, SaveValue, BorrowValue) &Account) {
        // Borrow a reference to the signer's moment collection
        let collectionRef = signer
            .storage
            .borrow<&TopShot.Collection>(from: /storage/MomentCollection)
            ?? panic("Could not borrow a reference to the owner's collection")

        // Withdraw the moment from the signer's collection
        let moment <- collectionRef.withdraw(withdrawID: momentID)

        // Get the recipient's account
        let recipientAccount = getAccount(recipient)

        // Borrow a reference to the recipient's moment collection
        let recipientCollectionRef = recipientAccount
            .capabilities
            .get<&TopShot.Collection>(/public/MomentCollection)
            .borrow()
            ?? panic("Could not borrow a reference to the recipient's collection")

        // Deposit the moment into the recipient's collection
        recipientCollectionRef.deposit(token: <-moment)
    }

    // Log the transfer
    execute {
        log("Moment successfully transferred")
    }
}
