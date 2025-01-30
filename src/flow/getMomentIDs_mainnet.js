export const getMomentIDs_mainnet = `
  import TopShot from 0x0b2a3299cc857e29

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
