export const commitSwap = `

import FungibleToken from 0xf233dcee88fe0abe
import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d

transaction(betAmount: UFix64) {

    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        // Withdraw the bet amount from the TSHOT token vault
        let tshotVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &TSHOT.Vault>(from: /storage/TSHOTTokenVault)!
        let bet <- tshotVault.withdraw(amount: betAmount)
        
        // Commit the bet and get a receipt
        let receipt <- TSHOTExchange.commitSwap(bet: <-bet)
        
        // Check if there’s already a receipt stored
        if signer.storage.type(at: TSHOTExchange.ReceiptStoragePath) != nil {
            panic("Storage collision at path=".concat(TSHOTExchange.ReceiptStoragePath.toString()).concat(" a Receipt is already stored!"))
        }

        // Save the receipt to storage
        signer.storage.save(<-receipt, to: TSHOTExchange.ReceiptStoragePath)
        
        // Check if a public capability already exists
        if signer.capabilities.borrow<&TSHOTExchange.Receipt>(/public/TSHOTReceipt) == nil {
            // Issue a new capability only if it doesn't exist
            let receiptCap = signer.capabilities.storage.issue<&TSHOTExchange.Receipt>(TSHOTExchange.ReceiptStoragePath)
            signer.capabilities.publish(receiptCap, at: /public/TSHOTReceipt)
        }
    }

    execute {
        log("Receipt stored and public capability issued if it didn't already exist.")
    }
}


`;
