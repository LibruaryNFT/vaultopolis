import DapperOffersV2 from 0xb8ea91944fd51c43

access(all) fun main(address: Address): AnyStruct {
	
     let account = getAccount(address)

    // Check if the public capability for the collection exists
    let collectionCap = account
        .capabilities
        .get<&DapperOffersV2.DapperOffer>(DapperOffersV2.DapperOffersPublicPath)
        .check()

    // If the capability does not exist, return false
    if !collectionCap {
        return false
    }

    // Check if the collection exists in the account by borrowing a public reference
    let collectionRef = account
        .capabilities
        .get<&DapperOffersV2.DapperOffer>(DapperOffersV2.DapperOffersPublicPath)
        .borrow()

    // If the collection reference does not exist, return false
    if collectionRef == nil {
        return false
    }

    // If both checks pass, return true
    return true
    

}



