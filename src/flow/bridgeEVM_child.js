// flow/bridgeEVM_child.js
export const bridgeEVM_child = `

// ─────────────────────────────────────────────────────────────────────────────
// batchBridgeNFTToEvm_fromChild  – v0.2  (2025-05-02)
//
// Bridges multiple NFTs that live in a Hybrid-Custody child account to the
// parent-signed Cadence-Owned Account (COA) on Flow EVM.
//
//   childAddress   : Address   – the HC child that holds the NFTs
//   nftIdentifier  : String    – e.g. "A.0b2a3299cc857e29.TopShot.NFT"
//   ids            : [UInt64]  – Cadence IDs to bridge
// ─────────────────────────────────────────────────────────────────────────────

import CrossVMMetadataViews        from 0x1d7e57aa55817448
import MetadataViews               from 0x1d7e57aa55817448
import ViewResolver                from 0x1d7e57aa55817448

import NonFungibleToken            from 0x1d7e57aa55817448
import FungibleToken               from 0xf233dcee88fe0abe
import FlowToken                   from 0x1654653399040a61
import FungibleTokenMetadataViews  from 0xf233dcee88fe0abe

import ScopedFTProviders           from 0x1e4aa0b87d10b141
import EVM                         from 0xe467b9dd11fa00df
import FlowEVMBridgeUtils          from 0x1e4aa0b87d10b141
import FlowEVMBridge               from 0x1e4aa0b87d10b141
import FlowEVMBridgeConfig         from 0x1e4aa0b87d10b141

import HybridCustody               from 0xd8a7e05a7ac670c0

transaction(childAddress: Address, nftIdentifier: String, ids: [UInt64]) {

    let coa: auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount
    let nftType: Type
    let requiresOnboarding: Bool
    let providerRef: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}

    prepare(signer: auth(Storage, Capabilities) &Account) {
        /* 1) Parent’s COA */
        self.coa = signer.storage
            .borrow<auth(EVM.Call, EVM.Bridge) &EVM.CadenceOwnedAccount>(from: /storage/evm)
            ?? panic("Parent COA not found at /storage/evm")

        /* 2) Parse NFT type + contract meta */
        self.nftType = CompositeType(nftIdentifier)
            ?? panic("Invalid nftIdentifier")
        let nftAddr = FlowEVMBridgeUtils.getContractAddress(fromType: self.nftType)
            ?? panic("Could not parse contract address")
        let nftName = FlowEVMBridgeUtils.getContractName(fromType: self.nftType)
            ?? panic("Could not parse contract name")

        let viewResolver = getAccount(nftAddr)
            .contracts
            .borrow<&{ViewResolver}>(name: nftName)
            ?? panic("ViewResolver missing on NFT contract")

        let collectionData = viewResolver.resolveContractView(
              resourceType: self.nftType,
              viewType: Type<MetadataViews.NFTCollectionData>()
          ) as! MetadataViews.NFTCollectionData?
          ?? panic("NFTCollectionData view not found")

        /* 3) Hybrid-Custody provider from child */
        let managerRef = signer.storage
            .borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(
                from: HybridCustody.ManagerStoragePath
            ) ?? panic("HybridCustody.Manager missing in parent storage")

        let child = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Parent does not control that child")

        let capType = Type<
            auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}
        >()

        let controllerID = child.getControllerIDForType(
            type: capType,
            forPath: collectionData.storagePath
        ) ?? panic("Controller ID for child’s collection not found")

        let cap = child.getCapability(
            controllerID: controllerID,
            type: capType
        ) as! Capability<
            auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Provider}
        >
        assert(cap.check(), message: "Invalid provider capability on child")
        self.providerRef = cap.borrow()
            ?? panic("Could not borrow provider from child")

        /* 4) Calculate fees + ScopedFTProvider */
        var approxFee = FlowEVMBridgeUtils.calculateBridgeFee(bytes: 400_000)
            + FlowEVMBridgeConfig.baseFee * UFix64(ids.length)

        self.requiresOnboarding =
            FlowEVMBridge.typeRequiresOnboarding(self.nftType)
                ?? panic("Bridge does not support this asset type")
        if self.requiresOnboarding {
            approxFee = approxFee + FlowEVMBridgeConfig.onboardFee
        }

        if signer.storage.type(at: FlowEVMBridgeConfig.providerCapabilityStoragePath) == nil {
            let vaultCap = signer.capabilities.storage.issue<
                auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            >(/storage/flowTokenVault)
            signer.storage.save(vaultCap, to: FlowEVMBridgeConfig.providerCapabilityStoragePath)
        }

        let vaultCapCopy = signer.storage.copy<
            Capability<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>
        >(from: FlowEVMBridgeConfig.providerCapabilityStoragePath)
            ?? panic("Vault provider capability missing")

        let scopedProv <- ScopedFTProviders.createScopedFTProvider(
            provider: vaultCapCopy,
            filters: [ScopedFTProviders.AllowanceFilter(approxFee)],
            expiration: getCurrentBlock().timestamp + 1.0
        )

        /* 5) Withdraw NFTs from child & deposit into COA */
        let first <- self.providerRef.withdraw(withdrawID: ids[0])
        self.coa.depositNFT(
            nft: <- first,
            feeProvider: &scopedProv as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
        )

        var i = 1
        while i < ids.length {
            let nft <- self.providerRef.withdraw(withdrawID: ids[i]!)
            self.coa.depositNFT(
                nft: <- nft,
                feeProvider: &scopedProv as auth(FungibleToken.Withdraw) &{FungibleToken.Provider}
            )
            i = i + 1
        }

        destroy scopedProv

        /* 6) Optional ERC-721 wrapper call */
        wrapAndTransferNFTsIfApplicable(
            self.coa,
            nftIDs: ids,
            nftType: self.nftType,
            viewResolver: viewResolver,
            recipientIfNotCoa: nil
        )
    }
}

/* ───────────────────────────── helper functions ──────────────────────────── */
/* Copied verbatim from the upstream bridge TX                                         */

access(all) fun wrapAndTransferNFTsIfApplicable(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    nftIDs: [UInt64],
    nftType: Type,
    viewResolver: &{ViewResolver},
    recipientIfNotCoa: EVM.EVMAddress?
) {
    if let crossVMPointer = viewResolver.resolveContractView(
            resourceType: nftType,
            viewType: Type<CrossVMMetadataViews.EVMPointer>()
    ) as! CrossVMMetadataViews.EVMPointer? {
        if let underlyingAddress = getUnderlyingERC721Address(coa, crossVMPointer.evmContractAddress) {
            if underlyingAddress.equals(
                    FlowEVMBridgeConfig.getEVMAddressAssociated(with: nftType)!
            ) {
                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, true]
                )
                let res = mustCall(coa, crossVMPointer.evmContractAddress,
                    functionSig: "depositFor(address,uint256[])",
                    args: [coa.address(), nftIDs]
                )
                let decoded = EVM.decodeABI(types: [Type<Bool>()], data: res.data)
                assert(decoded.length == 1 && decoded[0] as! Bool,
                       message: "Failed to wrap NFTs")

                if let to = recipientIfNotCoa {
                    mustTransferNFTs(coa, crossVMPointer.evmContractAddress, nftIDs: nftIDs, to: to)
                }

                mustCall(coa, underlyingAddress,
                    functionSig: "setApprovalForAll(address,bool)",
                    args: [crossVMPointer.evmContractAddress, false]
                )
            }
        }
    }
}

access(all) fun getUnderlyingERC721Address(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ wrapperAddress: EVM.EVMAddress
): EVM.EVMAddress? {
    let res = coa.call(
        to: wrapperAddress,
        data: EVM.encodeABIWithSignature("underlying()", []),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    if res.status != EVM.Status.successful || res.data.length == 0 {
        return nil
    }
    let decoded = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    assert(decoded.length == 1, message: "Invalid response length")
    return decoded[0] as! EVM.EVMAddress
}

access(all) fun isOwner(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    _ nftID: UInt64,
    _ ownerToCheck: EVM.EVMAddress
): Bool {
    let res = coa.call(
        to: erc721Address,
        data: EVM.encodeABIWithSignature("ownerOf(uint256)", [nftID]),
        gasLimit: 100_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful, message: "ownerOf call failed")
    let decoded = EVM.decodeABI(types: [Type<EVM.EVMAddress>()], data: res.data)
    if decoded.length == 1 {
        return (decoded[0] as! EVM.EVMAddress).equals(ownerToCheck)
    }
    return false
}

access(all) fun mustTransferNFTs(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ erc721Address: EVM.EVMAddress,
    nftIDs: [UInt64],
    to: EVM.EVMAddress
) {
    for id in nftIDs {
        assert(isOwner(coa, erc721Address, id, coa.address()),
               message: "NFT not owned by signer’s COA")
        mustCall(coa, erc721Address,
            functionSig: "safeTransferFrom(address,address,uint256)",
            args: [coa.address(), to, id]
        )
        assert(isOwner(coa, erc721Address, id, to),
               message: "Transfer failed")
    }
}

access(all) fun mustCall(
    _ coa: auth(EVM.Call) &EVM.CadenceOwnedAccount,
    _ contractAddr: EVM.EVMAddress,
    functionSig: String,
    args: [AnyStruct]
): EVM.Result {
    let res = coa.call(
        to: contractAddr,
        data: EVM.encodeABIWithSignature(functionSig, args),
        gasLimit: 4_000_000,
        value: EVM.Balance(attoflow: 0)
    )
    assert(res.status == EVM.Status.successful,
        message: "Failed to call '".concat(functionSig)
            .concat("'  errCode: ").concat(res.errorCode.toString())
            .concat("  msg: ").concat(res.errorMessage)
    )
    return res
}

`;
