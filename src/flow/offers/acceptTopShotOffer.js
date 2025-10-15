export const acceptTopShotOffer = `

import FungibleToken from 0xf233dcee88fe0abe
import NonFungibleToken from 0x1d7e57aa55817448
import ViewResolver from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import OffersV2 from 0xb8ea91944fd51c43
import DapperOffersV2 from 0xb8ea91944fd51c43

// A Top Shot owner runs this to accept a buyer's offer
// Parameters:
//
// buyerAddress: Address - Address of the buyer who created the offer
// offerId: UInt64 - ID of the offer to accept
// momentIdToSell: UInt64 - ID of the TopShot moment to sell

transaction(buyerAddress: Address, offerId: UInt64, momentIdToSell: UInt64) {
    
    let offer: &{OffersV2.OfferPublic}
    let sellerCollection: auth(NonFungibleToken.Withdraw) &TopShot.Collection
    let paymentReceiver: Capability<&{FungibleToken.Receiver}>

    prepare(seller: auth(Storage, Capabilities, NonFungibleToken.Withdraw) &Account) {
        
        let buyer = getAccount(buyerAddress)
        let dapperOfferCap = buyer.capabilities.get<&{DapperOffersV2.DapperOfferPublic}>(DapperOffersV2.DapperOffersPublicPath)
        assert(dapperOfferCap.check(), message: "Invalid DapperOffersV2 public capability")
        let publicDapperOffer = dapperOfferCap.borrow()
            ?? panic("Could not borrow buyer's public DapperOffer")
        
        self.offer = publicDapperOffer.borrowOffer(offerId: offerId) ?? panic("Offer not found")

        self.sellerCollection = seller.storage.borrow<auth(NonFungibleToken.Withdraw) &TopShot.Collection>(from: /storage/MomentCollection)
            ?? panic("Could not borrow seller's collection")

        self.paymentReceiver = seller.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
    }

    execute {
        
        let moment <- self.sellerCollection.withdraw(withdrawID: momentIdToSell)
        let resolvedMoment <- moment as! @{NonFungibleToken.NFT, ViewResolver.Resolver}

        self.offer.accept(item: <-resolvedMoment, receiverCapability: self.paymentReceiver)
    }
}
`;