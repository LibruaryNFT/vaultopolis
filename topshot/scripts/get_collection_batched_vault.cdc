import TopShot from 0x0b2a3299cc857e29

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
        serialNumber: UInt32,
        
    ) {
        self.id = id
        self.setID = setID
        self.playID = playID
        self.serialNumber = serialNumber
        
        
    }
}

access(all) fun main(address: Address, targetIDs: [UInt64]): [NFTDetails] {
    let account = getAccount(address)

    // Borrow the collection reference from the account
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Cache for set names to avoid redundant lookups
    var setNames: {UInt32: String} = {}

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the provided target IDs directly
    for id in targetIDs {
        let nftRef = collectionRef.borrowMoment(id: id)

        // If the NFT does not exist, skip it
        if nftRef == nil {
            continue
        }

        let nft = nftRef!

        let data = nft.data

        // Collect the details
        let nftDetails = NFTDetails(
            id: nft.id,
            setID: data.setID,
            playID: data.playID,
            serialNumber: data.serialNumber,
           
        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    // Return the array of NFT details
    return nftDetailsList
}

