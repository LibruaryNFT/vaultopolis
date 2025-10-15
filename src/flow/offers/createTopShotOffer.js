export const createTopShotOffer = `

import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x0ae53cb6e3f42a79
import NonFungibleToken from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import OffersV2 from 0xb8ea91944fd51c43
import DapperOffersV2 from 0xb8ea91944fd51c43
import Resolver from 0x1d7e57aa55817448

// This creates an edition-level offer for a Top Shot moment, defined by its setID and playID
// Parameters:
//
// amount: UFix64 - Offer amount in Flow tokens
// setId: UInt32 - TopShot set ID to offer for
// playId: UInt32 - TopShot play ID to offer for

transaction(amount: UFix64, setId: UInt32, playId: UInt32) {
    
    let dapperOfferManager: auth(DapperOffersV2.Manager) &DapperOffersV2.DapperOffer
    let flowVaultCap: Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>
    let nftReceiverCap: Capability<&{NonFungibleToken.CollectionPublic}>
    let resolverCap: Capability<&{Resolver.ResolverPublic}>

    prepare(user: auth(Storage, Capabilities) &Account) {
        
        self.dapperOfferManager = user.storage.borrow<auth(DapperOffersV2.Manager) &DapperOffersV2.DapperOffer>(from: DapperOffersV2.DapperOffersStoragePath)
            ?? panic("DapperOffer resource not found")

        self.flowVaultCap = user.capabilities.storage.issue<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(/storage/flowTokenVault)

        self.nftReceiverCap = user.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/MomentCollection)

        self.resolverCap = user.capabilities.get<&{Resolver.ResolverPublic}>(/public/OfferResolver)
    }

    execute {
        
        let offerParams: {String: String} = {
            "resolver": Resolver.ResolverType.TopShotEdition.rawValue.toString(),
            "setId": setId.toString(),
            "playId": playId.toString()
        }

        let offerId = self.dapperOfferManager.createOffer(
            vaultRefCapability: self.flowVaultCap,
            nftReceiverCapability: self.nftReceiverCap,
            nftType: Type<@TopShot.NFT>(),
            amount: amount,
            royalties: [],
            offerParamsString: offerParams,
            offerParamsUFix64: {},
            offerParamsUInt64: {},
            resolverCapability: self.resolverCap
        )
    }
}
`;
