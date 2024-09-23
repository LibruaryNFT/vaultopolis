import DapperOffersV2 from 0xb8ea91944fd51c43

access(all) fun main(address: Address): AnyStruct {
	
     let account = getAccount(address)

    var IDs : [UInt64] = []
    
    let collectionRef = account.capabilities.get<&DapperOffersV2.DapperOffer>(DapperOffersV2.DapperOffersPublicPath).borrow() 
    
    IDs = collectionRef?.getOfferIds() ?? []
    
    return IDs
}


