export const getAllDayCollectionBatched = `

import AllDay from 0xe4cf4bdc1751c65d

access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let editionID: UInt64
    access(all) let setID: UInt64
    access(all) let playID: UInt64
    access(all) let seriesID: UInt64
    access(all) let serialNumber: UInt64
    access(all) let tier: String

    init(id: UInt64, editionID: UInt64, setID: UInt64, playID: UInt64, seriesID: UInt64, serialNumber: UInt64, tier: String) {
        self.id = id
        self.editionID = editionID
        self.setID = setID
        self.playID = playID
        self.seriesID = seriesID
        self.serialNumber = serialNumber
        self.tier = tier
    }
}

access(all) fun main(address: Address, targetIDs: [UInt64]): [NFTDetails] {
    let account = getAccount(address)

    // Borrow the collection reference from the account
        let collectionRef = account
            .capabilities
            .borrow<&AllDay.Collection>(AllDay.CollectionPublicPath)
            ?? panic("Could not borrow a reference to the AllDay collection")

    var results: [NFTDetails] = []

    // Loop through each requested NFT ID
    for id in targetIDs {
        let maybeNft = collectionRef.borrowMomentNFT(id: id)
        if maybeNft == nil {
            // If the user doesn't actually own this ID, skip it
            continue
        }
        let nft = maybeNft!

        // Get edition data to extract tier and other edition info
        let editionData = AllDay.getEditionData(id: nft.editionID)
        
        let details = NFTDetails(
            id: nft.id,
            editionID: nft.editionID,
            setID: editionData.setID,
            playID: editionData.playID,
            seriesID: editionData.seriesID,
            serialNumber: nft.serialNumber,
            tier: editionData.tier
        )
        results.append(details)
    }

    return results
}

`;
