export const getTopShotCollection = `
import TopShot from 0x332ffc0ae9bba9c1

// Structure to hold the NFT details (with metadata)
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let setID: UInt32
    access(all) let playID: UInt32
    access(all) let serialNumber: UInt32


    init(id: UInt64, setID: UInt32, playID: UInt32, serialNumber: UInt32) {
        self.id = id
        self.setID = setID
        self.playID = playID
        self.serialNumber = serialNumber
    }
}

access(all) fun main(address: Address): [NFTDetails] {
    let account = getAccount(address)

    // Borrow the collection reference from the account
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection) 
        ?? panic("Could not borrow a reference to the collection")

    // Get all NFT IDs in the collection
    let nftIDs = collectionRef.getIDs()

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the NFT IDs, get metadata for each, and append to the list
    for id in nftIDs {
        let nftRef = collectionRef.borrowMoment(id: id) 
            ?? panic("Could not borrow a reference to the NFT")

        // Collect the details
        let nftDetails = NFTDetails(
            id: nftRef.id,
            setID: nftRef.data.setID,
            playID: nftRef.data.playID,
            serialNumber: nftRef.data.serialNumber

        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    // Return the array of NFT details
    return nftDetailsList
}
`;
