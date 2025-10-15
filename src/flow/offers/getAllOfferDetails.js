export const getAllOfferDetails = `

import DapperOffersV2 from 0xb8ea91944fd51c43
import OffersV2 from 0xb8ea91944fd51c43

// This script returns all offer details for an account
// Parameters:
//
// accountAddress: Address - Address of the account to check
//
// Returns: [OffersV2.OfferDetails]
// Array of all offer details for the account

access(all) fun main(accountAddress: Address): [OffersV2.OfferDetails] {
    
    let account = getAccount(accountAddress)
    
    let publicDapperOffer = account.capabilities.borrow<&{DapperOffersV2.DapperOfferPublic}>(DapperOffersV2.DapperOffersPublicPath)
        ?? panic("Could not borrow public DapperOffer capability")

    let offerIds = publicDapperOffer.getOfferIds()
    let offerDetails: [OffersV2.OfferDetails] = []
    
    for offerId in offerIds {
        if let offer = publicDapperOffer.borrowOffer(offerId: offerId) {
            offerDetails.append(offer.getDetails())
        }
    }
    
    return offerDetails
}
`;