export const acceptAllDayOffer_child = `

import FungibleToken from 0xf233dcee88fe0abe
import NonFungibleToken from 0x1d7e57aa55817448
import ViewResolver from 0x1d7e57aa55817448
import AllDay from 0xe4cf4bdc1751c65d
import OffersV2 from 0xb8ea91944fd51c43
import DapperOffersV2 from 0xb8ea91944fd51c43
import HybridCustody from 0xd8a7e05a7ac670c0

// Parent signs to accept a buyer's offer on behalf of a Hybrid-Custody child account
// Parameters:
//   childAddress   : Address  – the HC child that owns the AllDay moment
//   buyerAddress   : Address  – the buyer who created the offer
//   offerId        : UInt64   – ID of the offer to accept
//   momentIdToSell : UInt64   – ID of the AllDay moment (in the child) to sell

transaction(childAddress: Address, buyerAddress: Address, offerId: UInt64, momentIdToSell: UInt64) {

    let offer: &{OffersV2.OfferPublic}
    let childProvider: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}
    let parentFlowReceiver: Capability<&{FungibleToken.Receiver}>

    prepare(parent: auth(Storage, Capabilities) &Account) {

        // 1) Borrow buyer's public DapperOffers and locate the offer
        let buyer = getAccount(buyerAddress)
        let dapperOfferCap = buyer.capabilities.get<&{DapperOffersV2.DapperOfferPublic}>(DapperOffersV2.DapperOffersPublicPath)
        assert(dapperOfferCap.check(), message: "Invalid DapperOffersV2 public capability")
        let publicDapperOffer = dapperOfferCap.borrow()
            ?? panic("Could not borrow buyer's public DapperOffer")
        self.offer = publicDapperOffer.borrowOffer(offerId: offerId)
            ?? panic("Offer not found")

        // 2) Use HybridCustody to borrow withdraw capability from the child AllDay collection
        let managerRef = parent.storage
            .borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("HybridCustody.Manager not found in parent storage")

        let childAcct = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Parent lacks access to child account")

        let capType = Type<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>()
        let controllerID = childAcct.getControllerIDForType(
            type: capType,
            forPath: /storage/AllDayNFTCollection
        ) ?? panic("Controller ID for child's AllDay collection not found")

        let cap = childAcct.getCapability(
            controllerID: controllerID,
            type: capType
        ) as! Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}>
        assert(cap.check(), message: "Invalid provider capability on child")
        self.childProvider = cap.borrow()
            ?? panic("Could not borrow provider from child")

        // 3) Parent's FLOW token receiver capability — proceeds go to parent
        self.parentFlowReceiver = parent.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
        assert(self.parentFlowReceiver.check(), message: "Parent FLOW receiver capability invalid")
    }

    execute {
        // Withdraw the child's moment and accept the offer, paying proceeds to the child
        let moment <- self.childProvider.withdraw(withdrawID: momentIdToSell)
        let resolvedMoment <- moment as! @{NonFungibleToken.NFT, ViewResolver.Resolver}
        self.offer.accept(item: <- resolvedMoment, receiverCapability: self.parentFlowReceiver)
    }
}
`;


