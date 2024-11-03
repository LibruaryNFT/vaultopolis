export const verifyReceipt = `

import MomentSwapTSHOT from 0x332ffc0ae9bba9c1

access(all) fun main(userAddress: Address): Bool {
    // Get the account of the user
    let userAccount = getAccount(userAddress)

    // Try to borrow a reference to the Receipt from the public capability path
    let receiptRef = userAccount
        .capabilities
        .borrow<&MomentSwapTSHOT.Receipt>(/public/TSHOTReceipt)
        
    // Return true if a Receipt exists, otherwise false
    return receiptRef != nil
}
`;
