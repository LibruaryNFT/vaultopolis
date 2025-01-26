import "TopShot"
import "NonFungibleToken"

transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        if acct.storage.borrow<&TopShot.Collection>(from: /storage/MomentCollection) == nil {
            let collection <- TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>()) as! @TopShot.Collection
            acct.storage.save(<-collection, to: /storage/MomentCollection)
        }

        // Setup private withdraw capability
        acct.capabilities.publish(
            acct.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(
                /storage/MomentCollection
            ),
            at: /private/MomentCollection
        )
    }
}