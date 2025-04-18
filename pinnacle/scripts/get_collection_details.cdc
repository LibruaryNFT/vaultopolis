import Pinnacle from 0xedf9df96c92f4595

// Structure to hold the NFT details (with metadata)
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let editionID: Int
    access(all) let serialNumber: UInt64?


    init(id: UInt64, editionID: Int, serialNumber: UInt64?) {
        self.id = id
        self.editionID = editionID
        self.serialNumber = serialNumber
    }
}

access(all) fun main(address: Address): [NFTDetails] {
    let account = getAccount(address)

    // Borrow the collection reference from the account
    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Get all NFT IDs in the collection
    let nftIDs = collectionRef.getIDs()

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the NFT IDs, get metadata for each, and append to the list
    for id in nftIDs {
        let nftRef = collectionRef.borrowPinNFT(id: id)
            ?? panic("Could not borrow a reference to the NFT")

        // Collect the details
        let nftDetails = NFTDetails(
            id: nftRef.id,
            editionID: nftRef.editionID,
            serialNumber: nftRef.serialNumber
 
        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    // Return the array of NFT details
    return nftDetailsList
}
