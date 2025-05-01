export const revealSwap = `

import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d

/// Redeem a stored Receipt to get NFTs back
/// recipient the account that should receive the Moments
///
transaction(recipient: Address) {

    prepare(signer: auth(Storage, BorrowValue, LoadValue) &Account) {

        // Load the stored Receipt resource
        let receipt <- signer.storage.load<@TSHOTExchange.Receipt>(
            from: TSHOTExchange.ReceiptStoragePath
        ) ?? panic(
            "No Receipt found at ".concat(TSHOTExchange.ReceiptStoragePath.toString())
        )

        // Call the updated withdraw function (payer = signer)
        TSHOTExchange.swapTSHOTForNFTs(
            payer:      signer.address,
            recipient:  recipient,
            receipt:    <-receipt
        )
    }

    execute {
        log("Receipt redeemed; NFTs deposited to recipient.")
    }
}


`;
