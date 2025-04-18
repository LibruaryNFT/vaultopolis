import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595
import MetadataViews from 0x1d7e57aa55817448

access(all) struct PinNFTLite {
    //
    // Basic on-chain fields from the Pinnacle.NFT resource
    //
    access(all) let id: UInt64
    access(all) let editionID: Int
    access(all) let serialNumber: UInt64?
    access(all) let mintingDate: UInt64
    access(all) let xp: UInt64?

    //
    // MetadataViews.Traits
    //
    access(all) let traits: [MetadataViews.Trait]

    //
    // MetadataViews.Editions
    //
    access(all) let editions: [MetadataViews.Edition]

    init(
        id: UInt64,
        editionID: Int,
        serialNumber: UInt64?,
        mintingDate: UInt64,
        xp: UInt64?,
        traits: [MetadataViews.Trait],
        editions: [MetadataViews.Edition]
    ) {
        self.id = id
        self.editionID = editionID
        self.serialNumber = serialNumber
        self.mintingDate = mintingDate
        self.xp = xp
        self.traits = traits
        self.editions = editions
    }
}

access(all) fun main(address: Address, nftID: UInt64): PinNFTLite? {
    let account = getAccount(address)

    // Borrow the Pinnacle.Collection reference
    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the Pinnacle.Collection")

    // Borrow the actual NFT
    if let nftRef = collectionRef.borrowPinNFT(id: nftID) {
        // 1) On-chain fields from the NFT itself
        let id = nftRef.id
        let editionID = nftRef.editionID
        let serialNumber = nftRef.serialNumber
        let mintingDate = nftRef.mintingDate
        let xp = nftRef.xp

        // 2) Resolve only the MetadataViews we want: Traits + Editions
        let traitsView = nftRef.resolveView(Type<MetadataViews.Traits>()) as! MetadataViews.Traits?
        let editionsView = nftRef.resolveView(Type<MetadataViews.Editions>()) as! MetadataViews.Editions?

        // 3) Extract fields from each view if available
        let traits = traitsView?.traits ?? []
        let editions = editionsView?.infoList ?? []

        // 4) Construct and return the struct
        return PinNFTLite(
            id: id,
            editionID: editionID,
            serialNumber: serialNumber,
            mintingDate: mintingDate,
            xp: xp,
            traits: traits,
            editions: editions
        )
    } else {
        return nil
    }
}
