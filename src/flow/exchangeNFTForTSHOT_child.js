export const exchangeNFTForTSHOT_child = `

import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d
import NonFungibleToken from 0x1d7e57aa55817448
import TopShot from 0x0b2a3299cc857e29
import FungibleToken from 0xf233dcee88fe0abe
import HybridCustody from 0xd8a7e05a7ac670c0

transaction(childAddress: Address, nftIDs: [UInt64]) {

    let nfts: @[TopShot.NFT]
    let signerAddress: Address
    let provider: auth(NonFungibleToken.Withdraw)
                 &{ NonFungibleToken.Provider, NonFungibleToken.CollectionPublic }

    prepare(signer: auth(Storage, Capabilities) &Account) {

        pre {
            nftIDs.length > 0      : "No NFT IDs supplied."
            nftIDs.length <= 200: "Cannot swap more than 200 NFTs at once."
        }

        self.signerAddress = signer.address

        // ── ensure parent has a TSHOT vault (unchanged) ───────────────────
        let vaultPath = /storage/TSHOTTokenVault
        if signer.storage.borrow<&TSHOT.Vault>(from: vaultPath) == nil {
            let vault <- TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())
            signer.storage.save(<- vault, to: vaultPath)

            let recvCap = signer.capabilities.storage.issue<&{FungibleToken.Receiver}>(vaultPath)
            signer.capabilities.publish(recvCap, at: /public/TSHOTTokenReceiver)

            let balCap  = signer.capabilities.storage.issue<&{FungibleToken.Balance}>(vaultPath)
            signer.capabilities.publish(balCap, at: /public/TSHOTTokenBalance)
        }

        // ── borrow child’s TopShot collection via HybridCustody ───────────
        let mgr = signer.storage
            .borrow<auth(HybridCustody.Manage) & HybridCustody.Manager>(
                from: HybridCustody.ManagerStoragePath
            ) ?? panic("HybridCustody.Manager not found")

        let childAcct = mgr.borrowAccount(addr: childAddress)
            ?? panic("Parent lacks access to child account")

        let capType = Type<
            auth(NonFungibleToken.Withdraw)
            &{ NonFungibleToken.Provider, NonFungibleToken.CollectionPublic }>()

        let controllerID = childAcct.getControllerIDForType(
            type: capType,
            forPath: /storage/MomentCollection
        ) ?? panic("Controller ID not found")

        let cap = childAcct.getCapability(
            controllerID: controllerID,
            type: capType
        ) as! Capability<
            auth(NonFungibleToken.Withdraw)
            &{ NonFungibleToken.Provider, NonFungibleToken.CollectionPublic }>

        assert(cap.check(), message: "Invalid provider capability")
        self.provider = cap.borrow()!

        // resource array must carry a type annotation in Cadence 1.x
        self.nfts <- [] as @[TopShot.NFT]

        for id in nftIDs {
            let nft <- self.provider.withdraw(withdrawID: id) as! @TopShot.NFT
            self.nfts.append(<- nft)
        }
    }

    execute {
        TSHOTExchange.swapNFTsForTSHOT(
            payer:     self.signerAddress,
            nftIDs:    <- self.nfts,
            recipient: self.signerAddress   // TSHOT goes to the parent
        )
    }
}
`;
