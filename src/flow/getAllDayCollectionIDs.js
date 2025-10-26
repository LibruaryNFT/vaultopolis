export const getAllDayCollectionIDs = `

import AllDay from 0xe4cf4bdc1751c65d

// This script gets a list of all the AllDay NFT IDs an account owns
// Parameters:
// account: The Flow Address of the account whose AllDay NFT data needs to be read
// Returns: [UInt64] - list of all AllDay NFT IDs an account owns

access(all) fun main(account: Address): [UInt64] {

     let account = getAccount(account)

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .borrow<&AllDay.Collection>(AllDay.CollectionPublicPath)!

    log(collectionRef.getIDs())

    return collectionRef.getIDs()
}

`;

