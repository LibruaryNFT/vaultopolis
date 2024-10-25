import "TSHOT"

import "MomentSwapTSHOT"

/// Retrieves the saved Receipt and redeems it to reveal the coin toss result, depositing winnings with any luck
///
transaction {

    let address: Address

    prepare(signer: auth(BorrowValue, LoadValue) &Account) {
        self.address = signer.address

        // Load my receipt from storage
        let receipt <- signer.storage.load<@MomentSwapTSHOT.Receipt>(from: MomentSwapTSHOT.ReceiptStoragePath)
            ?? panic("No Receipt found in storage at path=".concat(MomentSwapTSHOT.ReceiptStoragePath.toString()))

        // Reveal by redeeming my receipt - fingers crossed!
        MomentSwapTSHOT.swapTSHOTForNFTs(address: self.address, receipt: <-receipt)



        //if winnings.balance > 0.0 {
            // Deposit winnings into my FlowToken Vault
            //let tshotVault = signer.storage.borrow<&TSHOT.Vault>(from: /storage/TSHOTTokenVault)!
          //  tshotVault.deposit(from: <-winnings)
        //} else {
        //    destroy winnings
        //}
    }
}