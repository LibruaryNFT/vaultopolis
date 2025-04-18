import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595

// removed  serialNumber: UInt64?,      mintingDate: UInt64,    xp: UInt64?

access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let editionID: Int

    init(
        id: UInt64,
        editionID: Int,
       
    ) {
        self.id = id
        self.editionID = editionID
    }
}

access(all) fun main(address: Address, nftID: UInt64): NFTDetails? {

    let account = getAccount(address)

    // Get the account's public collection capability
       let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Borrow the Pinnacle NFT using the provided ID
    if let nftRef = collectionRef.borrowPinNFT(id: nftID) {
        return NFTDetails(
            id: nftRef.id,
            editionID: nftRef.editionID,

        )
    } else {
        return nil // Return nil if the NFT could not be found
    }
}
