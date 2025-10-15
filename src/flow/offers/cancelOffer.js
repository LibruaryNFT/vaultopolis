export const cancelOffer = `

import DapperOffersV2 from 0xb8ea91944fd51c43

// The original buyer runs this to cancel their own active offer
// Parameters:
//
// offerIdToCancel: UInt64 - ID of the offer to cancel

transaction(offerIdToCancel: UInt64) {
    
    let dapperOfferManager: auth(DapperOffersV2.Manager) &DapperOffersV2.DapperOffer

    prepare(user: auth(Storage) &Account) {
        
        self.dapperOfferManager = user.storage.borrow<auth(DapperOffersV2.Manager) &DapperOffersV2.DapperOffer>(from: DapperOffersV2.DapperOffersStoragePath)
            ?? panic("DapperOffer resource not found")
    }

    execute {
        
        self.dapperOfferManager.removeOffer(offerId: offerIdToCancel)
    }
}
`;