export const getMomentIDs = `

  import TopShot from 0x0b2a3299cc857e29

  access(all) fun main(account: Address): [UInt64] {
    let acct = getAccount(account)

    let collectionRef = acct
      .capabilities
      .borrow<&{TopShot.MomentCollectionPublic}>(/public/MomentCollection)!

    return collectionRef.getIDs()
  }
`;
