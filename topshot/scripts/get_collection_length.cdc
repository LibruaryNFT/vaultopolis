import "TopShot"

// This is the script to get a list of all the moments' ids an account owns
// Just change the argument to `getAccount` to whatever account you want
// and as long as they have a published Collection receiver, you can see
// the moments they own.

// Parameters:
//
// account: The Flow Address of the account whose moment data needs to be read

// Returns: [UInt64]
// list of all moments' ids an account owns

access(all) fun main(account: Address): Int {

     let account = getAccount(account)

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .borrow<&TopShot.Collection>(/public/MomentCollection)!

    log(collectionRef.getLength())

    return collectionRef.getLength()
}