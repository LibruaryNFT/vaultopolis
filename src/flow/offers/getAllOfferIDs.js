export const getAllOfferIDs = `

import DapperOffersV2 from 0xb8ea91944fd51c43

// This script checks an account and returns a list of all its active offer IDs
// Parameters:
//
// accountAddress: Address - Address of the account to check
//
// Returns: [UInt64]
// Array of all active offer IDs for the account

access(all) fun main(accountAddress: Address): [UInt64] {
    
    let account = getAccount(accountAddress)
    
    let publicDapperOffer = account.capabilities.borrow<&{DapperOffersV2.DapperOfferPublic}>(DapperOffersV2.DapperOffersPublicPath)
        ?? panic("Could not borrow public DapperOffer capability")

    return publicDapperOffer.getOfferIds()
}
`;