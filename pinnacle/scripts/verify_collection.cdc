import Pinnacle from 0xedf9df96c92f4595

access(all) fun main(address: Address): Bool {
    let account = getAccount(address)

    // Check if the public capability for the collection exists
    let collectionCap = account
        .capabilities
        .get<&Pinnacle.Collection>(/public/PinnacleCollection)
        .check()

    // If the capability does not exist, return false
    if !collectionCap {
        return false
    }

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .get<&Pinnacle.Collection>(/public/PinnacleCollection)
        .borrow()

    // If the collection reference does not exist, return false
    if collectionRef == nil {
        return false
    }

    // If both checks pass, return true
    return true
}