export const getOfferDetails = `

import OffersV2 from 0xb8ea91944fd51c43
import DapperOffersV2 from 0xb8ea91944fd51c43

// This script returns the details for a single, specific offer
// Parameters:
//
// accountAddress: Address - Address of the account containing the offer
// offerId: UInt64 - ID of the offer to get details for
//
// Returns: OffersV2.OfferDetails?
// Offer details if found, nil if offer doesn't exist

access(all) fun main(accountAddress: Address, offerId: UInt64): OffersV2.OfferDetails? {
    
    let account = getAccount(accountAddress)
    
    let publicDapperOffer = account.capabilities.borrow<&{DapperOffersV2.DapperOfferPublic}>(DapperOffersV2.DapperOffersPublicPath)
        ?? panic("Could not borrow public DapperOffer capability")

    if let offer = publicDapperOffer.borrowOffer(offerId: offerId) {
        return offer.getDetails()
    }
    
    return nil
}
`;

