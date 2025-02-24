export const revealSwap = `

import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d

/// Retrieves the saved Receipt and redeems it to reveal the coin toss result, depositing winnings with any luck
///
transaction(address: Address) {

    prepare(signer: auth(BorrowValue, LoadValue) &Account) {
        // Load my receipt from storage
        let receipt <- signer.storage.load<@TSHOTExchange.Receipt>(from: TSHOTExchange.ReceiptStoragePath)
            ?? panic("No Receipt found in storage at path=".concat(TSHOTExchange.ReceiptStoragePath.toString()))

        // Use the provided address to redeem the receipt
        TSHOTExchange.swapTSHOTForNFTs(address: address, receipt: <-receipt)
    }
}

`;
