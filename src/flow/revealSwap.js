export const revealSwap = `

import TSHOT from 0x332ffc0ae9bba9c1
import MomentSwapTSHOT from 0x332ffc0ae9bba9c1

/// Retrieves the saved Receipt and redeems it to reveal the coin toss result, depositing winnings with any luck
///
transaction(address: Address) {

    prepare(signer: auth(BorrowValue, LoadValue) &Account) {
        // Load my receipt from storage
        let receipt <- signer.storage.load<@MomentSwapTSHOT.Receipt>(from: MomentSwapTSHOT.ReceiptStoragePath)
            ?? panic("No Receipt found in storage at path=".concat(MomentSwapTSHOT.ReceiptStoragePath.toString()))

        // Use the provided address to redeem the receipt
        MomentSwapTSHOT.swapTSHOTForNFTs(address: address, receipt: <-receipt)
    }
}

`;
