export const getMomentIDs = `
  import TopShot from 0x332ffc0ae9bba9c1

  access(all) fun main(account: Address): [UInt64] {
    let acct = getAccount(account)

    let collectionRef = acct
      .capabilities
      .borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)!

    return collectionRef.getIDs()
  }
`;
