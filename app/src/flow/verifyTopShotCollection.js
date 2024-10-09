export const verifyTopShotCollection = `
  import TopShot from 0x332ffc0ae9bba9c1

  access(all) fun main(address: Address): Bool {
    let account = getAccount(address)

    // Check if the public capability for the collection exists
    let collectionCap = account
        .capabilities
        .get<&TopShot.Collection>(/public/MomentCollection)
        .check()

    // If the capability does not exist, return false
    if !collectionCap {
        return false
    }

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .get<&TopShot.Collection>(/public/MomentCollection)
        .borrow()

    // If the collection reference does not exist, return false
    if collectionRef == nil {
        return false
    }

    // If both checks pass, return true
    return true
  }
`;
