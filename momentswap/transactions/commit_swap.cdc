import "FungibleToken"
import "TSHOT"
import "MomentSwapTSHOT"

transaction(betAmount: UFix64) {

    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        // Withdraw the bet amount from the TSHOT token vault
        let tshotVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &TSHOT.Vault>(from: /storage/TSHOTTokenVault)!
        let bet <- tshotVault.withdraw(amount: betAmount)
        
        // Commit the bet and get a receipt
        let receipt <- MomentSwapTSHOT.commitSwap(bet: <-bet)
        
        // Check if there’s already a receipt stored
        if signer.storage.type(at: MomentSwapTSHOT.ReceiptStoragePath) != nil {
            panic("Storage collision at path=".concat(MomentSwapTSHOT.ReceiptStoragePath.toString()).concat(" a Receipt is already stored!"))
        }

        // Save the receipt to storage
        signer.storage.save(<-receipt, to: MomentSwapTSHOT.ReceiptStoragePath)
        
        // Create a public capability for the stored receipt
        let receiptCap = signer.capabilities.storage.issue<&MomentSwapTSHOT.Receipt>(MomentSwapTSHOT.ReceiptStoragePath)
        signer.capabilities.publish(receiptCap, at: /public/TSHOTReceipt)
    }

    execute {
        log("Receipt stored and public capability issued.")
    }
}
