import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595
import MetadataViews from 0x1d7e57aa55817448

//Result: A.1d7e57aa55817448.MetadataViews.Editions(infoList: [A.1d7e57aa55817448.MetadataViews.Edition
//(name: "Tin Toy [Pixar Animation Studios \u{2022} Pixar Alien Remix Vol.1, Standard]", number: 0, max: 1753)])

access(all) fun main(address: Address, _id: UInt64): MetadataViews.Editions {
    let account = getAccount(address)

     let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    let nft = collectionRef.borrowNFT(_id) !as &{NonFungibleToken.NFT}
    
    // Get the Editions view for this Pinnacle NFT
    let editionsView = nft.resolveView(Type<MetadataViews.Editions>()) as! MetadataViews.Editions?

    // Ensure that the editionsView is not nil before returning
    return editionsView ?? panic("Could not resolve the Editions view for this NFT")
}
