import NonFungibleToken from 0x1d7e57aa55817448
import HWGarageCardV2 from 0xd0bcefdf1e67ea85
import MetadataViews from 0x1d7e57aa55817448

// Adjust contract address above if needed: 0xd0bcefdf1e67ea85

access(all) struct MyHotWheelsData {
    //
    // Example fields you want to retrieve for a HWGarageCardV2 NFT
    //
    access(all) let mint: UInt64
    access(all) let series: String
    access(all) let totalSupply: UInt64
    access(all) let cardId: UInt64
    access(all) let redeemable: String
    access(all) let rarity: String
    access(all) let miniCollection: String
    access(all) let typeField: String
    access(all) let releaseYear: String

    init(
        mint: UInt64,
        series: String,
        totalSupply: UInt64,
        cardId: UInt64,
        redeemable: String,
        rarity: String,
        miniCollection: String,
        typeField: String,
        releaseYear: String
    ) {
        self.mint = mint
        self.series = series
        self.totalSupply = totalSupply
        self.cardId = cardId
        self.redeemable = redeemable
        self.rarity = rarity
        self.miniCollection = miniCollection
        self.typeField = typeField
        self.releaseYear = releaseYear
    }
}

//
// Returns MyHotWheelsData? for a given user (address) + NFT ID
//
access(all) fun main(address: Address, nftID: UInt64): MyHotWheelsData? {

    // 1) Borrow the user's public HWGarageCardV2 collection ref
    let collectionRef = getAccount(address)
        .capabilities
        .borrow<&HWGarageCardV2.Collection>(HWGarageCardV2.CollectionPublicPath)
        ?? panic("Could not borrow a reference to the HWGarageCardV2.Collection")

    // 2) Borrow the NFT by ID
    let nftRef = collectionRef.borrowCard(id: nftID)
        ?? panic("No NFT with that ID in HWGarageCardV2.Collection")

    // 3) The total supply from the contract
    let totalSupply = HWGarageCardV2.getTotalSupply()

    // 4) We'll define "mint" as nftRef.cardEditionID, but adjust as you like
    let mintNumber = nftRef.cardEditionID

    // 5) "Series" from packSeriesID
    let seriesString = "Series ".concat(nftRef.packSeriesID.toString())

    // 6) The NFT's ID (Flow's unique resource ID)
    let cardId = nftRef.id

    // 7) The "redeemable" field from the NFT
    let redeemStatus = nftRef.redeemable

    // 8) Parse some metadata fields
    let metadata = nftRef.metadata

    // These may or may not exist; fallback to "Unknown"
    let rarityVal = metadata["rarity"] ?? "Unknown"
    let miniCollVal = metadata["miniCollection"] ?? "Unknown"
    let typeVal = metadata["type"] ?? "Unknown"
    let releaseVal = metadata["releaseYear"] ?? "Unknown"

    // 9) Return the struct
    return MyHotWheelsData(
        mint: mintNumber,
        series: seriesString,
        totalSupply: totalSupply,
        cardId: cardId,
        redeemable: redeemStatus,
        rarity: rarityVal,
        miniCollection: miniCollVal,
        typeField: typeVal,
        releaseYear: releaseVal
    )
}
