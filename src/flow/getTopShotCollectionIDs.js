export const getTopShotCollectionIDs = `

import TopShot from 0x332ffc0ae9bba9c1

// This is the script to get a list of all the moments' ids an account owns
// Just change the argument to to whatever account you want
// and as long as they have a published Collection receiver, you can see
// the moments they own.

// Parameters:
//
// account: The Flow Address of the account whose moment data needs to be read

// Returns: [UInt64]
// list of all moments' ids an account owns

access(all) fun main(account: Address): [UInt64] {

     let account = getAccount(account)

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)!

    log(collectionRef.getIDs())

    return collectionRef.getIDs()
}

`;
