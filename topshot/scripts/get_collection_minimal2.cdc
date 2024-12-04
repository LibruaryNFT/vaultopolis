import "TopShot"

// Structure to hold the NFT details with additional fields
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let setID: UInt32
    access(all) let playID: UInt32
    access(all) let serialNumber: UInt32

    init(
        id: UInt64,
        setID: UInt32,
        playID: UInt32,
        serialNumber: UInt32
    ) {
        self.id = id
        self.setID = setID
        self.playID = playID
        self.serialNumber = serialNumber
    }
}

access(all) fun main(address: Address): [NFTDetails] {
    let account = getAccount(address)

    // Check if the public capability for the collection exists
    let collectionCap = account
        .capabilities
        .get<&TopShot.Collection>(/public/MomentCollection)
        .check()

    // If the capability does not exist, return an empty array
    if !collectionCap {
        return []
    }

    // Borrow the collection reference
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)

    // If the collection reference does not exist, return an empty array
    if collectionRef == nil {
        return []
    }

    // Get all NFT IDs in the collection
    let nftIDs = collectionRef!.getIDs()

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the NFT IDs and collect details
    for id in nftIDs {
        let nftRef = collectionRef!.borrowMoment(id: id)
            ?? panic("Could not borrow the TopShot NFT")

        nftDetailsList.append(
            NFTDetails(
                id: nftRef.id,
                setID: nftRef.data.setID,
                playID: nftRef.data.playID,
                serialNumber: nftRef.data.serialNumber
            )
        )
    }

    return nftDetailsList
}
