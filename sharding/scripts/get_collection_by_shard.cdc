import "TopShot"
import "TopShotTiers"
import "TopShotLocking"
import "TopShotShardedCollectionV2"

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
    access(all) let tier: String
    access(all) let seriesID: UInt32
    access(all) let isLocked: Bool
    access(all) let numMomentsInEdition: UInt32

    init(
        id: UInt64,
        setID: UInt32,
        setName: String,
        playID: UInt32,
        playerName: String,
        jerseyNumber: String,
        teamAtMoment: String,
        serialNumber: UInt32,
        tier: String,
        seriesID: UInt32,
        isLocked: Bool,
        numMomentsInEdition: UInt32
    ) {
        self.id = id
        self.setID = setID
        self.setName = setName
        self.playID = playID
        self.playerName = playerName
        self.jerseyNumber = jerseyNumber
        self.teamAtMoment = teamAtMoment
        self.serialNumber = serialNumber
        self.tier = tier
        self.seriesID = seriesID
        self.isLocked = isLocked
        self.numMomentsInEdition = numMomentsInEdition
    }
}

access(all) fun main(account: Address, shardID: UInt64): [NFTDetails] {
    let acct = getAccount(account)

    // Borrow the public capability for the ShardedCollection
    let shardedCollectionRef = acct.capabilities
        .get<&TopShotShardedCollectionV2.ShardedCollection>(/public/MomentCollection)
        .borrow()
        ?? panic("Could not borrow the ShardedCollection reference")

    // Get NFT IDs in the specified shard
    let nftIDs = shardedCollectionRef.getShardIDs(shardIndex: shardID)

    // Cache for set names to avoid redundant lookups
    var setNames: {UInt32: String} = {}

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the NFT IDs in the specified shard
    for id in nftIDs {
        let nftRef = shardedCollectionRef.borrowMoment(id: id)
            ?? panic("Could not borrow the TopShot NFT")

        let data = nftRef.data

        // Get the tier of the NFT using the TopShotTiers contract
        let tier = TopShotTiers.getTier(nft: nftRef)
        let tierString = tier != nil ? TopShotTiers.tierToString(tier: tier!) : "Unknown Tier"

        // Get the seriesID associated with the setID
        let seriesID = TopShot.getSetSeries(setID: data.setID)
            ?? panic("Could not get the series for setID")

        // Get isLocked status
        let isLocked = TopShotLocking.isLocked(nftRef: nftRef)

        // Get setName, cache it to avoid redundant calls
        let setID = data.setID
        var setName = setNames[setID] ?? ""

        // If setName is still empty, fetch it and cache it
        if setName == "" {
            setName = TopShot.getSetName(setID: setID) ?? "Unknown Set"
            setNames[setID] = setName
        }

        // Get play metadata
        let playMetadata = TopShot.getPlayMetaData(playID: data.playID) ?? {}
        let playerName = playMetadata["FullName"] ?? "Unknown Player"
        let jerseyNumber = playMetadata["JerseyNumber"] ?? "Unknown Jersey Number"
        let teamAtMoment = playMetadata["TeamAtMoment"] ?? "Unknown Team"

        // Get the number of moments in this edition
        let numMomentsInEdition = TopShot.getNumMomentsInEdition(setID: data.setID, playID: data.playID)
            ?? panic("Could not get the number of moments in edition")

        // Collect the details
        let nftDetails = NFTDetails(
            id: nftRef.id,
            setID: data.setID,
            setName: setName,
            playID: data.playID,
            playerName: playerName,
            jerseyNumber: jerseyNumber,
            teamAtMoment: teamAtMoment,
            serialNumber: data.serialNumber,
            tier: tierString,
            seriesID: seriesID,
            isLocked: isLocked,
            numMomentsInEdition: numMomentsInEdition
        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    // Return the array of NFT details
    return nftDetailsList
}