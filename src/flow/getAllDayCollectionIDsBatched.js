// src/flow/getAllDayCollectionIDsBatched.js

export const getAllDayCollectionIDsBatched = `
import AllDay from 0xe4cf4bdc1751c65d

// This script gets AllDay NFT IDs in batches to handle large collections
// Parameters:
// account: The Flow Address of the account whose AllDay NFT data needs to be read
// startIndex: Starting index for the batch
// batchSize: Number of IDs to return in this batch
// Returns: [UInt64] - list of AllDay NFT IDs in this batch

access(all) fun main(account: Address, startIndex: UInt64, batchSize: UInt64): [UInt64] {
    let account = getAccount(account)

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .borrow<&AllDay.Collection>(/public/AllDayNFTCollection)!

    // Get all IDs
    let allIds = collectionRef.getIDs()
    let totalCount = allIds.length
    
    // Calculate the end index for this batch
    let endIndex = startIndex + batchSize
    if (endIndex > totalCount) {
        endIndex = totalCount
    }
    
    // Return the batch
    var batch: [UInt64] = []
    var i = startIndex
    while i < endIndex {
        batch.append(allIds[i])
        i = i + 1
    }
    
    return batch
}
`;

