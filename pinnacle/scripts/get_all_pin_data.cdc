import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595
import MetadataViews from 0x1d7e57aa55817448

access(all) struct FullNFTMetadata {
    access(all) let id: UInt64
    access(all) let editionID: Int
    access(all) let serialNumber: UInt64?
    access(all) let mintingDate: UInt64
    access(all) let xp: UInt64?

    // Display
    access(all) let name: String
    access(all) let description: String
    access(all) let thumbnailURL: String?

    // Traits
    access(all) let traits: [MetadataViews.Trait]

    // Editions
    access(all) let editions: [MetadataViews.Edition]

    // ExternalURL
    access(all) let externalURL: String?

    // Royalties
    access(all) let royalties: [MetadataViews.Royalty]?

    // Medias
    access(all) let medias: [MetadataViews.Media]?

    init(
        id: UInt64,
        editionID: Int,
        serialNumber: UInt64?,
        mintingDate: UInt64,
        xp: UInt64?,
        name: String,
        description: String,
        thumbnailURL: String?,
        traits: [MetadataViews.Trait],
        editions: [MetadataViews.Edition],
        externalURL: String?,
        royalties: [MetadataViews.Royalty]?,
        medias: [MetadataViews.Media]?
    ) {
        self.id = id
        self.editionID = editionID
        self.serialNumber = serialNumber
        self.mintingDate = mintingDate
        self.xp = xp
        self.name = name
        self.description = description
        self.thumbnailURL = thumbnailURL
        self.traits = traits
        self.editions = editions
        self.externalURL = externalURL
        self.royalties = royalties
        self.medias = medias
    }
}

access(all) fun main(address: Address, nftID: UInt64): FullNFTMetadata? {
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

        // 2) Resolve multiple metadata views
        let displayView = nftRef.resolveView(Type<MetadataViews.Display>()) as! MetadataViews.Display?
        let traitsView = nftRef.resolveView(Type<MetadataViews.Traits>()) as! MetadataViews.Traits?
        let editionsView = nftRef.resolveView(Type<MetadataViews.Editions>()) as! MetadataViews.Editions?
        let externalURLView = nftRef.resolveView(Type<MetadataViews.ExternalURL>()) as! MetadataViews.ExternalURL?
        let royaltiesView = nftRef.resolveView(Type<MetadataViews.Royalties>()) as! MetadataViews.Royalties?
        let mediasView = nftRef.resolveView(Type<MetadataViews.Medias>()) as! MetadataViews.Medias?

        // 3) Extract fields from each view if available
        // Display
        let name = displayView?.name ?? "Unknown"
        let description = displayView?.description ?? "No description"

        // For thumbnail, we check if it's an HTTPFile
        var thumbnailURL: String? = nil
        if let thumb = displayView?.thumbnail {
            if let httpThumb = thumb as? MetadataViews.HTTPFile {
                thumbnailURL = httpThumb.url
            }
        }

        // Traits
        let traits = traitsView?.traits ?? []

        // Editions
        let editions = editionsView?.infoList ?? []

        // External URL
        let externalURL = externalURLView?.url

        // Royalties
        let royalties = royaltiesView?.getRoyalties()

        // Medias
        let medias = mediasView?.items

        // 4) Construct and return the struct
        return FullNFTMetadata(
            id: id,
            editionID: editionID,
            serialNumber: serialNumber,
            mintingDate: mintingDate,
            xp: xp,
            name: name,
            description: description,
            thumbnailURL: thumbnailURL,
            traits: traits,
            editions: editions,
            externalURL: externalURL,
            royalties: royalties,
            medias: medias
        )

    } else {
        return nil
    }
}
