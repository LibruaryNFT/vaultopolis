import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595

access(all) fun main(accountAddress: Address): [UInt64] {
    let account = getAccount(accountAddress)

    // Borrow a reference to the Pinnacle collection directly
    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)
        ?? panic("Could not borrow a reference to the collection")

    // Access the ownedNFTs dictionary directly
    let ownedNFTs = collectionRef.ownedNFTs

    // Initialize an empty array to hold the NFT IDs
    let nftIds: [UInt64] = []

    // Iterate over the dictionary keys (NFT IDs)
    for key in ownedNFTs.keys {
        nftIds.append(key)
    }

    // Return the array of NFT IDs
    return nftIds
}
