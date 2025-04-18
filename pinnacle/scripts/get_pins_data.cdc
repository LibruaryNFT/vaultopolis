import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595

// Result: s.c53d78cc94da6d54b7dc77ba66cf7beb408b335e10572f19bb0e06e8c864e422.NFTDetails(id: 203409652149326, editionID: 550)

// Removed serialNumber: UInt64?, mintingDate: UInt64, xp: UInt64?
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let editionID: Int

    init(id: UInt64, editionID: Int) {
        self.id = id
        self.editionID = editionID
    }
}

access(all) fun main(address: Address, nftIDs: [UInt64]): [NFTDetails] {

    let account = getAccount(address)

    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")
        
    var nftDetailsList: [NFTDetails] = []

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
