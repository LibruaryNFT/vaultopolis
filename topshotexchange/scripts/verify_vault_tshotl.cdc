import "TSHOTL"
import "FungibleToken"

access(all) fun main(userAddress: Address): Bool {
    // Get the account of the user
    let userAccount = getAccount(userAddress)

    // Check if the user has the Receiver capability
    let receiverCap = userAccount
        .capabilities
        .borrow<&{FungibleToken.Receiver}>(TSHOTL.tokenReceiverPath)
        ?? panic("User does not have a Receiver capability at the expected path.")

    // Check if the user has the Balance capability
    let balanceCap = userAccount
        .capabilities
        .borrow<&{FungibleToken.Balance}>(TSHOTL.tokenBalancePath)
        ?? panic("User does not have a Balance capability at the expected path.")

    // If both capabilities are valid, the vault is correctly set up
    return receiverCap != nil && balanceCap != nil
}




