export const cleanupOffer = `

import DapperOffersV2 from 0xb8ea91944fd51c43

// Cleanup a purchased (completed) offer from the caller's DapperOffer resource
// Parameters:
// - offerId: UInt64 - ID of the offer to clean up (must be purchased)

transaction(offerId: UInt64) {

    let offerPublic: &{DapperOffersV2.DapperOfferPublic}

    prepare(signer: auth(Capabilities) &Account) {
        let cap = signer
            .capabilities
            .get<&{DapperOffersV2.DapperOfferPublic}>(DapperOffersV2.DapperOffersPublicPath)
        assert(cap.check(), message: "Missing DapperOffersV2 public capability")
        self.offerPublic = cap.borrow() ?? panic("Could not borrow DapperOffersV2 public interface")
    }

    execute {
        self.offerPublic.cleanup(offerId: offerId)
    }
}


`;