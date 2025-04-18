import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595
import MetadataViews from 0x1d7e57aa55817448

access(all) struct NFTTraits {
    access(all) let traits: [MetadataViews.Trait]

    init(traits: [MetadataViews.Trait]) {
        self.traits = traits
    }
}

access(all) fun main(address: Address, _id: UInt64): NFTTraits? {
    let account = getAccount(address)

    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Borrow the NFT using the provided ID
    let nft = collectionRef.borrowNFT(_id) !as &{NonFungibleToken.NFT}

    // Resolve the Traits view for the NFT
    let traitsView = nft.resolveView(Type<MetadataViews.Traits>()) as! MetadataViews.Traits?

    if let view = traitsView {
        return NFTTraits(traits: view.traits)
    } else {
        return nil
    }
}
