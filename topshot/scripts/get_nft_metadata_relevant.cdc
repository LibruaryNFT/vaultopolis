import TopShot from 0x0b2a3299cc857e29
import MetadataViews from 0x1d7e57aa55817448

access(all) struct MyTopShotData {
    access(all) let id: UInt64              // The NFT resource ID
    access(all) let setName: String
    access(all) let serialNumber: UInt64
    access(all) let setID: UInt64
    access(all) let playID: UInt64
    access(all) let numMomentsInEdition: UInt64
    access(all) let subeditionID: UInt64
    access(all) let subedition: String
    access(all) let fullName: String
    access(all) let seriesNumber: UInt64

    init(
        id: UInt64,
        setName: String,
        serialNumber: UInt64,
        setID: UInt64,
        playID: UInt64,
        numMomentsInEdition: UInt64,
        subeditionID: UInt64,
        subedition: String,
        fullName: String,
        seriesNumber: UInt64
    ) {
        self.id = id
        self.setName = setName
        self.serialNumber = serialNumber
        self.setID = setID
        self.playID = playID
        self.numMomentsInEdition = numMomentsInEdition
        self.subeditionID = subeditionID
        self.subedition = subedition
        self.fullName = fullName
        self.seriesNumber = seriesNumber
    }
}

access(all) fun main(address: Address, nftID: UInt64): MyTopShotData {
    // 1) Borrow the user's public MomentCollection
    let collectionRef = getAccount(address)
        .capabilities
        .borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)
        ?? panic("Could not borrow a reference to the MomentCollection")

    // 2) Borrow the specific NFT (Moment)
    let nftRef = collectionRef.borrowMoment(id: nftID)
        ?? panic("Could not borrow the moment with the given ID")

    // The resource ID (unique for each NFT)
    let resourceID = nftRef.id

    // 3) The TopShotMomentMetadataView
    let metaView = nftRef.resolveView(Type<TopShot.TopShotMomentMetadataView>())
        ?? panic("NFT does not implement TopShotMomentMetadataView")

    let metadata = metaView as! TopShot.TopShotMomentMetadataView

    // --- Set up defaults for each field ---
    var setName: String = "Unknown Set"
    var serialNumber: UInt64 = 0
    var setID: UInt64 = 0
    var playID: UInt64 = 0
    var numMomentsInEdition: UInt64 = 0
    var fullName: String = "Unknown Name"
    var seriesNumber: UInt64 = 0

    // 4) Unwrap each optional if not nil

    if metadata.setName != nil {
        setName = metadata.setName!
    }

    if metadata.serialNumber != nil {
        serialNumber = UInt64(metadata.serialNumber!)
    }

    if metadata.setID != nil {
        setID = UInt64(metadata.setID!)
    }

    if metadata.playID != nil {
        playID = UInt64(metadata.playID!)
    }

    if metadata.numMomentsInEdition != nil {
        numMomentsInEdition = UInt64(metadata.numMomentsInEdition!)
    }

    if metadata.fullName != nil {
        fullName = metadata.fullName!
    }

    if metadata.seriesNumber != nil {
        seriesNumber = UInt64(metadata.seriesNumber!)
    }

    // 5) Subedition fields from MetadataViews.Traits
    var subeditionID: UInt64 = 0
    var subedition: String = "Standard" // fallback

    let traitsViewOpt = nftRef.resolveView(Type<MetadataViews.Traits>()) 
    if traitsViewOpt != nil {
        let traitsView = traitsViewOpt! as! MetadataViews.Traits
        for trait in traitsView.traits {
            if trait.name == "SubeditionID" {
                // trait.value could be UInt64 or a string we can parse
                if let asUInt64 = trait.value as? UInt64 {
                    subeditionID = asUInt64
                } else if let asString = trait.value as? String {
                    let parsed = UInt64.fromString(asString)
                    if parsed != nil {
                        subeditionID = parsed!
                    }
                }
            } else if trait.name == "Subedition" {
                // trait.value could be a string
                if let asString = trait.value as? String {
                    subedition = asString
                }
            }
        }
    }

    // 6) Return the struct
    return MyTopShotData(
        id: resourceID,
        setName: setName,
        serialNumber: serialNumber,
        setID: setID,
        playID: playID,
        numMomentsInEdition: numMomentsInEdition,
        subeditionID: subeditionID,
        subedition: subedition,
        fullName: fullName,
        seriesNumber: seriesNumber
    )
}
