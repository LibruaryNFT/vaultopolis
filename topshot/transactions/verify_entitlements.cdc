import "NonFungibleToken"
import "TopShot"

transaction(userAddress: Address) {

    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Issue a capability to the TopShot Collection stored in the user's account
        let userCollectionCap = acct.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(/storage/MomentCollection)

        // Now try to borrow the reference using this capability
        let userCollection = userCollectionCap.borrow()

        if userCollection == nil {
            log("Could not borrow reference to user's TopShot Collection")
            return
        }

        log("User has the correct capability with Withdraw entitlement and the reference was successfully borrowed")
    }

    execute {
        log("Entitlement verification completed")
    }
}
