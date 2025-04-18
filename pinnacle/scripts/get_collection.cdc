import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595

access(all) fun main(address: Address): [UInt64] {

    let account = getAccount(address)

    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Get and return all the NFT IDs in the collection
    return collectionRef.getIDs()
}
