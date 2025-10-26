// src/flow/getAllDayCollectionCount.js

export const getAllDayCollectionCount = `
import AllDay from 0xe4cf4bdc1751c65d

// This script gets the total count of AllDay NFTs an account owns
// Parameters:
// account: The Flow Address of the account whose AllDay NFT count needs to be read
// Returns: UInt64 - total count of AllDay NFTs an account owns

access(all) fun main(account: Address): UInt64 {
    let account = getAccount(account)

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .borrow<&AllDay.Collection>(/public/AllDayNFTCollection)!

    // Get all IDs and return the count
    let ids = collectionRef.getIDs()
    return ids.length
}
`;

