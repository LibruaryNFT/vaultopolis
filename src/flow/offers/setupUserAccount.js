export const setupUserAccount = `

import FungibleToken from 0xf233dcee88fe0abe
import FlowToken from 0x0ae53cb6e3f42a79
import NonFungibleToken from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import DapperOffersV2 from 0xb8ea91944fd51c43
import Resolver from 0x1d7e57aa55817448

// This transaction prepares any account to participate in the offer system.
// Must be run once for any user who wants to make or accept offers.

transaction {

    prepare(user: auth(Storage, Capabilities) &Account) {
        // 1. Set up DapperOffer resource for managing offers
        if user.storage.borrow<&DapperOffersV2.DapperOffer>(from: DapperOffersV2.DapperOffersStoragePath) == nil {
            user.storage.save(<-DapperOffersV2.createDapperOffer(), to: DapperOffersV2.DapperOffersStoragePath)
            user.capabilities.publish(
                user.capabilities.storage.issue<&{DapperOffersV2.DapperOfferPublic}>(DapperOffersV2.DapperOffersStoragePath),
                at: DapperOffersV2.DapperOffersPublicPath
            )
        }

        // 2. Set up FLOW Token vault if needed
        if user.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) == nil {
            user.storage.save(<-FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()), to: /storage/flowTokenVault)

            user.capabilities.publish(
                user.capabilities.storage.issue<&{FungibleToken.Receiver}>(/storage/flowTokenVault),
                at: /public/flowTokenReceiver
            )
            user.capabilities.publish(
                user.capabilities.storage.issue<&{FungibleToken.Balance}>(/storage/flowTokenVault),
                at: /public/flowTokenBalance
            )
        }

        // 3. Set up TopShot collection if needed
        if user.storage.borrow<&TopShot.Collection>(from: /storage/MomentCollection) == nil {
            user.storage.save(<-TopShot.createEmptyCollection(nftType: Type<@TopShot.NFT>()), to: /storage/MomentCollection)
            user.capabilities.publish(
                user.capabilities.storage.issue<&{NonFungibleToken.CollectionPublic}>(/storage/MomentCollection),
                at: /public/MomentCollection
            )
        }
        
        // 4. Set up Resolver resource 
        if user.storage.borrow<&Resolver.OfferResolver>(from: /storage/OfferResolver) == nil {
            user.storage.save(<-Resolver.createResolver(), to: /storage/OfferResolver)
            user.capabilities.publish(
                user.capabilities.storage.issue<&{Resolver.ResolverPublic}>(/storage/OfferResolver),
                at: /public/OfferResolver
            )
        }
    }
}
`;