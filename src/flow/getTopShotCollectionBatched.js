export const getTopShotCollectionBatched = `

import TopShot from 0x0b2a3299cc857e29
import TopShotLocking from 0x0b2a3299cc857e29

access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let setID: UInt32
    access(all) let playID: UInt32
    access(all) let serialNumber: UInt32
    access(all) let isLocked: Bool
    // Just the subedition ID (optional)
    access(all) let subeditionID: UInt32?

    init(
        id: UInt64,
        setID: UInt32,
        playID: UInt32,
        serialNumber: UInt32,
        isLocked: Bool,
        subeditionID: UInt32?
    ) {
        self.id = id
        self.setID = setID
        self.playID = playID
        self.serialNumber = serialNumber
        self.isLocked = isLocked
        self.subeditionID = subeditionID
    }
}

access(all) fun main(address: Address, targetIDs: [UInt64]): [NFTDetails] {
    let account = getAccount(address)

    // Borrow the collection
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)
        ?? panic("Could not borrow a reference to the collection")

    var nftDetailsList: [NFTDetails] = []

    for id in targetIDs {
        let nftRef = collectionRef.borrowMoment(id: id)
        if nftRef == nil {
            continue
        }
        let nft = nftRef!
        let data = nft.data

        let isLocked = TopShotLocking.isLocked(nftRef: nft)

        // The subedition ID is safe to read. It returns UInt32? (nil if none).
        let subID = TopShot.getMomentsSubedition(nftID: id)

        let item = NFTDetails(
            id: nft.id,
            setID: data.setID,
            playID: data.playID,
            serialNumber: data.serialNumber,
            isLocked: isLocked,
            subeditionID: subID // store optional as-is
        )

        nftDetailsList.append(item)
    }

    return nftDetailsList
}


`;
