import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595

access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let editionID: Int

    init(id: UInt64, editionID: Int) {
        self.id = id
        self.editionID = editionID
    }
}

access(all) fun main(address: Address): [NFTDetails] {
    let account = getAccount(address)

    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Get all NFT IDs
    let nftIDs = collectionRef.getIDs()

    // List to store details for each NFT
    var nftDetailsList: [NFTDetails] = []

    // Fetch details for each NFT
    for nftID in nftIDs {
        if let nftRef = collectionRef.borrowPinNFT(id: nftID) {
            let details = NFTDetails(
                id: nftRef.id,
                editionID: nftRef.editionID
            )
            nftDetailsList.append(details)
        }
    }

    return nftDetailsList
}
