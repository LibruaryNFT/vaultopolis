import "TopShot"
import "TopShotLocking"

// Structure to hold the NFT details with additional fields
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let setID: UInt32
    access(all) let setName: String
    access(all) let playID: UInt32
    access(all) let playerName: String
    access(all) let jerseyNumber: String
    access(all) let teamAtMoment: String
    access(all) let serialNumber: UInt32
    access(all) let seriesID: UInt32
    access(all) let isLocked: Bool
    access(all) let numMomentsInEdition: UInt32
    access(all) let seriesNumber: UInt32
    access(all) let subeditionID: UInt32?
    access(all) let subeditionName: String?
    access(all) let subeditionMetadata: {String: String}?

    init(
        id: UInt64,
        setID: UInt32,
        setName: String,
        playID: UInt32,
        playerName: String,
        jerseyNumber: String,
        teamAtMoment: String,
        serialNumber: UInt32,
        seriesID: UInt32,
        isLocked: Bool,
        numMomentsInEdition: UInt32,
        seriesNumber: UInt32,
        subeditionID: UInt32?,
        subeditionName: String?,
        subeditionMetadata: {String: String}?
    ) {
        self.id = id
        self.setID = setID
        self.setName = setName
        self.playID = playID
        self.playerName = playerName
        self.jerseyNumber = jerseyNumber
        self.teamAtMoment = teamAtMoment
        self.serialNumber = serialNumber
        self.seriesID = seriesID
        self.isLocked = isLocked
        self.numMomentsInEdition = numMomentsInEdition
        self.seriesNumber = seriesNumber
        self.subeditionID = subeditionID
        self.subeditionName = subeditionName
        self.subeditionMetadata = subeditionMetadata
    }
}

// Helper function to check if a subedition exists
access(all) fun subeditionExists(subeditionID: UInt32): Bool {
    let allSubeditions = TopShot.getAllSubeditions()
    for subedition in allSubeditions {
        if subedition.subeditionID == subeditionID {
            return true
        }
    }
    return false
}

access(all) fun main(address: Address, nftID: UInt64): NFTDetails? {
    let account = getAccount(address)

    // Borrow the collection reference from the account
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Attempt to borrow the specified NFT ID
    let nftRef = collectionRef.borrowMoment(id: nftID)
        ?? panic("Could not borrow the TopShot NFT with the specified ID")

    let data = nftRef.data

    // Get the seriesID associated with the setID
    let seriesID = TopShot.getSetSeries(setID: data.setID)
        ?? panic("Could not get the series for setID")

    // Get isLocked status
    let isLocked = TopShotLocking.isLocked(nftRef: nftRef)

    // Get setName
    let setID = data.setID
    let setName = TopShot.getSetName(setID: setID) ?? "Unknown Set"

    // Get play metadata
    let playMetadata = TopShot.getPlayMetaData(playID: data.playID) ?? {}
    let playerName = playMetadata["FullName"] ?? "Unknown Player"
    let jerseyNumber = playMetadata["JerseyNumber"] ?? "Unknown Jersey Number"
    let teamAtMoment = playMetadata["TeamAtMoment"] ?? "Unknown Team"

    // Get the number of moments in this edition
    let numMomentsInEdition = TopShot.getNumMomentsInEdition(setID: data.setID, playID: data.playID)
        ?? panic("Could not get the number of moments in edition")

    // Retrieve seriesNumber and subedition information
    let seriesNumber = TopShot.getSetSeries(setID: data.setID) ?? 0

    let subeditionID = TopShot.getMomentsSubedition(nftID: nftID)
    var subeditionName: String? = nil
    var subeditionMetadata: {String: String}? = nil

    if let subID = subeditionID {
        // Check if the subedition exists
        if subeditionExists(subeditionID: subID) {
            let subeditionData = TopShot.getSubeditionByID(subeditionID: subID)
            subeditionName = subeditionData.name

            // Use a temporary dictionary to hold metadata values
            var tempMetadata: {String: String} = {}

            // Manually copy the metadata to avoid type mismatch
            for key in subeditionData.metadata.keys {
                let value = subeditionData.metadata[key] ?? ""
                tempMetadata[key] = value
            }

            // Assign the temporary dictionary to subeditionMetadata
            subeditionMetadata = tempMetadata
        }
    }

    // Collect the details
    return NFTDetails(
        id: nftRef.id,
        setID: data.setID,
        setName: setName,
        playID: data.playID,
        playerName: playerName,
        jerseyNumber: jerseyNumber,
        teamAtMoment: teamAtMoment,
        serialNumber: data.serialNumber,
        seriesID: seriesID,
        isLocked: isLocked,
        numMomentsInEdition: numMomentsInEdition,
        seriesNumber: seriesNumber,
        subeditionID: subeditionID,
        subeditionName: subeditionName,
        subeditionMetadata: subeditionMetadata
    )
}
