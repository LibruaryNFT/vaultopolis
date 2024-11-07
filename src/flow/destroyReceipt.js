export const destroyReceipt = `

import MomentSwapTSHOT from 0x332ffc0ae9bba9c1

transaction {

    prepare(signer: auth(Storage, LoadValue, BorrowValue, SaveValue, Capabilities) &Account) {
        // Check if the receipt exists in storage
        if signer.storage.type(at: MomentSwapTSHOT.ReceiptStoragePath) == nil {
            panic("No receipt found at path: ".concat(MomentSwapTSHOT.ReceiptStoragePath.toString()))
        }

        // Load and destroy the receipt from storage
        let receipt <- signer.storage.load<@MomentSwapTSHOT.Receipt>(from: MomentSwapTSHOT.ReceiptStoragePath)
        destroy receipt

        // Unpublish the public capability if it exists
        if signer.capabilities.borrow<&MomentSwapTSHOT.Receipt>(/public/TSHOTReceipt) != nil {
            signer.capabilities.unpublish(/public/TSHOTReceipt)
        }
    }

    execute {
        log("Receipt destroyed and public capability unpublished.")
    }
}

`;
