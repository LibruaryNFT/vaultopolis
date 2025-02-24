export const getTopShotCollection = `

import TopShot from 0x0b2a3299cc857e29
import TopShotTiers from 0xb1788d64d512026d
import TopShotLocking from 0x0b2a3299cc857e29

// Structure to hold the NFT details with additional fields
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let setID: UInt32
    access(all) let playID: UInt32
    access(all) let serialNumber: UInt32
    access(all) let tier: String
    access(all) let isLocked: Bool

    init(
        id: UInt64,
        setID: UInt32,
        playID: UInt32,
        serialNumber: UInt32,
        tier: String,
        isLocked: Bool,
    ) {
        self.id = id
        self.setID = setID
        self.playID = playID
        self.serialNumber = serialNumber
        self.tier = tier
        self.isLocked = isLocked
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

    // Loop through the NFT IDs, get metadata, tier, seriesID, etc.
    for id in nftIDs {
        let nftRef = collectionRef.borrowMoment(id: id)
            ?? panic("Could not borrow the TopShot NFT")

        let data = nftRef.data

        // Get the tier of the NFT using your custom contract
        let tier = TopShotTiers.getTier(nft: nftRef)
        let tierString = tier != nil ? TopShotTiers.tierToString(tier: tier!) : ""


        // Get isLocked status
        let isLocked = TopShotLocking.isLocked(nftRef: nftRef)

        // Collect the details
        let nftDetails = NFTDetails(
            id: nftRef.id,
            setID: data.setID,
            playID: data.playID,
            serialNumber: data.serialNumber,
            tier: tierString,
            isLocked: isLocked,
        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    // Return the array of NFT details
    return nftDetailsList
}


`;
