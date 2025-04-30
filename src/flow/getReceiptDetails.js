export const getReceiptDetails = `

import TSHOTExchange from 0x05b67ba314000b2d

// Script that retrieves specific fields from the Receipt associated with TSHOTExchange
access(all) fun main(userAddress: Address): {String: AnyStruct} {
    // Get the account of the user
    let userAccount = getAccount(userAddress)

    // Try to borrow a reference to the Receipt from the public capability path
    let receiptRef = userAccount
        .capabilities
        .borrow<&TSHOTExchange.Receipt>(/public/TSHOTReceipt)
    
    // Check if the Receipt exists and return its fields, otherwise return an empty result
    if let receipt = receiptRef {
        // Extract fields from the Receipt
        let betAmount = receipt.betAmount
        let requestBlock = receipt.getRequestBlock() ?? panic("No request block found in Receipt")
        let canFulfill = receipt.canFullfillRequest()

        // Access additional fields from the randomness request in the Receipt
        let requestUUID = receipt.request?.uuid ?? panic("No UUID found for the randomness request.")
        let isFulfilled = receipt.request?.fulfilled ?? panic("Could not determine if the randomness request is fulfilled.")

        // Return the extracted information in a dictionary format
        return {
            "betAmount": betAmount,
            "requestBlock": requestBlock,
            "canFulfill": canFulfill,
            "requestUUID": requestUUID,
            "isFulfilled": isFulfilled
        }
    } else {
        // Return empty dictionary if no Receipt found
        return {}
    }
}

`;
