import "TopShot"
import "TopShotTiers"

access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let setID: UInt32
    access(all) let playID: UInt32
    access(all) let serialNumber: UInt32
    access(all) let tier: String
    access(all) let seriesID: UInt32

    init(
        id: UInt64,
        setID: UInt32,
        playID: UInt32,
        serialNumber: UInt32,
        tier: String,
        seriesID: UInt32
    ) {
        self.id = id
        self.setID = setID
        self.playID = playID
        self.serialNumber = serialNumber
        self.tier = tier
        self.seriesID = seriesID
    }
}

access(all) fun main(address: Address, targetIDs: [UInt64]): [NFTDetails] {
    let account = getAccount(address)

    // Legacy approach: borrow from 'account.capabilities' instead of .getCapability(...)
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)
        ?? panic("Could not borrow a reference to the TopShot collection")

    var results: [NFTDetails] = []

    // Loop through each requested NFT ID
    for id in targetIDs {
        let maybeNft = collectionRef.borrowMoment(id: id)
        if maybeNft == nil {
            // If the user doesn't actually own this ID, skip it
            continue
        }
        let nft = maybeNft!
        let data = nft.data

        // Attempt to determine the tier using your TopShotTiers contract
        let possibleTier = TopShotTiers.getTier(nft: nft)

        var tierString: String = ""
        if possibleTier == nil {
            tierString = "Unknown"
        } else {
            tierString = TopShotTiers.tierToString(tier: possibleTier!)
        }

        // Fetch which series the setID belongs to
        let seriesID = TopShot.getSetSeries(setID: data.setID)
            ?? panic("Could not determine the series for setID: "
                .concat(data.setID.toString()))

        let details = NFTDetails(
            id: nft.id,
            setID: data.setID,
            playID: data.playID,
            serialNumber: data.serialNumber,
            tier: tierString,
            seriesID: seriesID
        )
        results.append(details)
    }

    return results
}