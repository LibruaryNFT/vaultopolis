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

    }
}