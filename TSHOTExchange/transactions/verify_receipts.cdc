import "MomentSwapTSHOT"

transaction {

    prepare(signer: auth(Storage) &Account) {
        // Hardcoded storage path based on the contract address
        let receiptStoragePath = /storage/TSHOTReceipt_0xf8d6e0586b0a20c7

        // Borrow the Receipt from the user's storage using the hardcoded path
        let receiptRef = signer.storage.borrow<&MomentSwapTSHOT.Receipt>(from: receiptStoragePath)
            ?? panic("No Receipt found in storage at the specified path.")

        // Extract information from the Receipt
        let betAmount = receiptRef.betAmount
        let requestBlock = receiptRef.getRequestBlock() ?? panic("No request block found in Receipt")
        let canFulfill = receiptRef.canFullfillRequest()

        // Access additional fields from the randomness request in the Receipt
        let requestUUID = receiptRef.request?.uuid ?? panic("No UUID found for the randomness request.")
        let isFulfilled = receiptRef.request?.fulfilled ?? panic("Could not determine if the randomness request is fulfilled.")

        // Log the information
        log("Bet Amount: ".concat(betAmount.toString()))
        log("Request Block: ".concat(requestBlock.toString()))
        log("Can Fulfill Request: ".concat(canFulfill ? "true" : "false"))
        log("Request UUID: ".concat(requestUUID.toString()))
        log("Is Request Fulfilled: ".concat(isFulfilled ? "true" : "false"))
    }

    execute {
        log("Transaction executed successfully.")
    }
}
