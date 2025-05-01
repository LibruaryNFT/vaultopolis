export const commitSwap = `

import FungibleToken from 0xf233dcee88fe0abe
import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d

transaction(betAmount: UFix64) {

    prepare(signer: auth(Storage, BorrowValue, Capabilities) &Account) {

        // enforce 50-TSHOT limit (unchanged)
        if betAmount > 50.0 {
            panic("Cannot commit more than 50 TSHOT.")
        }

        // withdraw bet from the user's vault
        let vaultRef = signer.storage
            .borrow<auth(FungibleToken.Withdraw) & TSHOT.Vault>(from: /storage/TSHOTTokenVault)
            ?? panic("Cannot borrow TSHOT vault")
        let bet <- vaultRef.withdraw(amount: betAmount)

        let receipt <- TSHOTExchange.commitSwap(
            payer: signer.address,
            bet:   <- bet
        )

        // save receipt and (optionally) publish capability
        if signer.storage.type(at: TSHOTExchange.ReceiptStoragePath) != nil {
            panic("Receipt already stored at ".concat(TSHOTExchange.ReceiptStoragePath.toString()))
        }
        signer.storage.save(<- receipt, to: TSHOTExchange.ReceiptStoragePath)

        if signer.capabilities.borrow<&TSHOTExchange.Receipt>(/public/TSHOTReceipt) == nil {
            let cap = signer.capabilities.storage.issue<&TSHOTExchange.Receipt>(
                TSHOTExchange.ReceiptStoragePath
            )
            signer.capabilities.publish(cap, at: /public/TSHOTReceipt)
        }
    }

    execute {
        log("Commit successful: receipt saved and capability published.")
    }
}



`;
