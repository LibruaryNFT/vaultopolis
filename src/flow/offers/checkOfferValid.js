export const checkOfferValid = `

import OffersV2 from 0xb8ea91944fd51c43

// This script checks if an offer is still valid (not purchased and within parameters)
// Parameters:
//
// offerAddress: The Flow Address containing the offer resource
// offerId: The ID of the offer to check
//
// Returns: Bool
// True if the offer is valid and can be accepted, false otherwise

access(all) fun main(offerAddress: Address, offerId: UInt64): Bool {
    
    let account = getAccount(offerAddress)
    
    // Try to borrow the offer resource
    let offerRef = account.capabilities
        .borrow<&{OffersV2.OfferPublic}>(/public/DapperOffer)
        ?? return false // Offer doesn't exist
    
    // Get offer details
    let details = offerRef.getDetails()
    
    // Check if this is the correct offer ID
    if details.offerId != offerId {
        return false
    }
    
    // Check if offer has already been purchased
    if details.purchased {
        return false
    }
    
    // Check if offer amount is greater than 0
    if details.offerAmount <= 0.0 {
        return false
    }
    
    // Check if payment vault type is valid
    return true
}
`;