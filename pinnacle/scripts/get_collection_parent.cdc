import NonFungibleToken from 0x1d7e57aa55817448
import Pinnacle from 0xedf9df96c92f4595
import HybridCustody from 0xd8a7e05a7ac670c0

// Structure to hold the NFT details (with metadata)
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let editionID: Int
    access(all) let serialNumber: UInt64?

    init(id: UInt64, editionID: Int, serialNumber: UInt64?) {
        self.id = id
        self.editionID = editionID
        self.serialNumber = serialNumber
    }
}

// Function to get the NFT details from a specific address
access(all) fun getNFTsFromAddress(address: Address): [NFTDetails] {
    let account = getAccount(address)

    // Attempt to borrow the collection reference from the account
    let collectionRef = account
        .capabilities
        .borrow<&Pinnacle.Collection>(/public/PinnacleCollection)

    // If the collection doesn't exist, return an empty array
    if collectionRef == nil {
        return []
    }

    // Get all NFT IDs in the collection
    let nftIDs = collectionRef!.getIDs()

    // Array to hold the details of each NFT
    var nftDetailsList: [NFTDetails] = []

    // Loop through the NFT IDs, get metadata for each, and append to the list
    for id in nftIDs {
        let nftRef = collectionRef!.borrowPinNFT(id: id)
            ?? panic("Could not borrow a reference to the NFT")

        // Collect the details
        let nftDetails = NFTDetails(
            id: nftRef.id,
            editionID: nftRef.editionID,
            serialNumber: nftRef.serialNumber
        )

        // Append to the array
        nftDetailsList.append(nftDetails)
    }

    return nftDetailsList
}

// Main function to get NFTs from both the parent and its child accounts
access(all) fun main(address: Address): [NFTDetails] {
    // Array to hold all NFTs (from parent and children)
    var allNftDetails: [NFTDetails] = []

    // Try to get NFTs from the parent account
    let parentNFTs = getNFTsFromAddress(address: address)
    allNftDetails.appendAll(parentNFTs)

    // Get the child addresses from the parent
    let acct = getAuthAccount<auth(Storage) &Account>(address)
    let manager = 
        acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
        ?? panic("Manager not found")

    let childAddresses = manager.getChildAddresses()

    // Loop through child addresses and get their NFTs
    for childAddress in childAddresses {
        let childNFTs = getNFTsFromAddress(address: childAddress)
        allNftDetails.appendAll(childNFTs)
    }

    // Return all NFT details
    return allNftDetails
}
