import "TopShot"
import "MetadataViews"

access(all) fun main(address: Address, id: UInt64): [String] {
    // Get the account reference
    let account = getAccount(address)

    // Borrow the collection reference
    let collectionRef = account
        .capabilities
        .borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
        ?? panic("Could not borrow a reference to the Moment Collection")

    // Borrow the specific NFT
    let nft = collectionRef.borrowMoment(id: id)
        ?? panic("Could not borrow the moment with the given ID")

    // Retrieve all supported Metadata Views
    let views = nft.getViews()

    // Convert view types to readable strings
    return views.map(fun (view: Type): String {
        return view.identifier
    })
}
