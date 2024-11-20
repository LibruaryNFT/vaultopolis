import "TopShot"
import "NonFungibleToken"

transaction {

    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Check if the collection exists, create if it doesn't
        if acct.storage.borrow<&TopShot.Collection>(from: /storage/MomentCollection) == nil {
            let collection <- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>()) as! @TopShot.Collection
            acct.storage.save(<-collection, to: /storage/MomentCollection)
        }

        // Unpublish any existing public capability
        acct.capabilities.unpublish(/public/MomentCollection)

        // Publish a capability with the expected type
        acct.capabilities.publish(
            acct.capabilities.storage.issue<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(/storage/MomentCollection),
            at: /public/MomentCollection
        )
    }
}
