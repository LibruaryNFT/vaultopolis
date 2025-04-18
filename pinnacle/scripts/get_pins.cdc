import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595

access(all) fun main(address: Address): {UInt64: {String: AnyStruct}} {

    let account = getAccount(address)

    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    let nftIDs = collectionRef.getIDs()
    let nftDetails: {UInt64: {String: AnyStruct}} = {}

    for nftID in nftIDs {
        let nft = collectionRef.borrowNFT(nftID)

        // Ensure that nft is not nil
        if let validNFT = nft {
            // Get the NFT metadata using optional chaining
            let view = validNFT.resolveView(Type<MetadataViews.Display>())!
            let display = view as! MetadataViews.Display

            // Store relevant information
            nftDetails[nftID] = {
                "name": display.name,
                "description": display.description,
                "thumbnail": display.thumbnail.uri()
            }
        } else {
           
        }
    }

    return nftDetails
}
