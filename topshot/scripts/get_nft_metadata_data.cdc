import "TopShot"
import "MetadataViews"

access(all) struct MetadataResult {
    access(all) let viewType: String
    access(all) let data: AnyStruct?

    init(viewType: String, data: AnyStruct?) {
        self.viewType = viewType
        self.data = data
    }
}

access(all) fun main(address: Address, id: UInt64): [MetadataResult] {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
        ?? panic("Could not borrow a reference to the Moment Collection")

    let nft = collectionRef.borrowMoment(id: id)
        ?? panic("Could not borrow the moment with the given ID")

    let views = nft.getViews()
    
    var results: [MetadataResult] = []

    for view in views {
        let resolvedView = nft.resolveView(view)

        // Add the result for this view type
        results.append(MetadataResult(
            viewType: view.identifier,
            data: resolvedView
        ))
    }

    return results
}
