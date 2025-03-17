export const destroyReceipt = `

import TSHOTExchange from 0x05b67ba314000b2d

transaction {

    prepare(signer: auth(Storage, LoadValue, BorrowValue, SaveValue, Capabilities) &Account) {
        // Define the storage path for the receipt
        let receiptPath = TSHOTExchange.ReceiptStoragePath
        let publicPath = /public/TSHOTReceipt

        // Check if the receipt exists in storage
        if signer.storage.type(at: receiptPath) == nil {
            panic("No receipt found at path: ".concat(receiptPath.toString()))
        }

        // Load and destroy the receipt from storage
        let receipt <- signer.storage.load<@TSHOTExchange.Receipt>(from: receiptPath)
        destroy receipt

        // Unpublish the public capability if it exists
        if signer.capabilities.borrow<&TSHOTExchange.Receipt>(publicPath) != nil {
            signer.capabilities.unpublish(publicPath)
        }
    }

    execute {
        log("TSHOT receipt destroyed and public capability unpublished.")
    }
}


`;
