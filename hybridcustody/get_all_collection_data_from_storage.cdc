import "NonFungibleToken"
import "MetadataViews"
import "ViewResolver"
import "HybridCustody"

/// Helper function that retrieves data about all publicly accessible NFTs in an account
///
access(all) fun main(_ address: Address): [MetadataViews.NFTCollectionData] {

    let account: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
    let data: [MetadataViews.NFTCollectionData] = []

    let collectionType: Type = Type<@{NonFungibleToken.CollectionPublic, ViewResolver.ResolverCollection}>()
    let viewType: Type = Type<MetadataViews.NFTCollectionData>()

    // Iterate over each public path
    account.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
        // Return if not the type we're looking for
        if !type.isInstance(collectionType) && !type.isSubtype(of: collectionType) {
            return true
        }
        if let collectionRef = account.storage
            .borrow<&{NonFungibleToken.CollectionPublic, ViewResolver.ResolverCollection}>(from: path) {
            // Return early if no Resolver found in the Collection
            let ids: [UInt64]= collectionRef.getIDs()
            if ids.length == 0 {
                return true
            }

            // Otherwise, attempt to get the NFTCollectionData & append if exists
            let nft = collectionRef.borrowNFT(ids[0]) ?? panic("nft not found")
            if let dataView = nft.resolveView(viewType) as! MetadataViews.NFTCollectionData? {
                data.append(dataView)
            }
        }
        return true
    })
    return data
}
