import FungibleToken from 0xf233dcee88fe0abe
import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d
import HybridCustody from 0xd8a7e05a7ac670c0

transaction(childAddress: Address, betAmount: UFix64) {

    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {
        // Borrow the HybridCustody manager from the parent’s storage.
        let managerRef = signer
            .storage
            .borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("Could not borrow HybridCustody.Manager from signer's storage")
        
        // Use the manager to get a reference to the child account.
        let childAccount = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Signer does not have access to the specified child account")
        
        // Borrow the child's TSHOT token vault.
        // This assumes the child account has a published capability for its TSHOT vault,
        // or that your HybridCustody manager can access the child’s storage.
        let childVaultRef = childAccount
            .borrow<&TSHOT.Vault>(from: /storage/TSHOTTokenVault)
            ?? panic("Could not borrow child's TSHOT vault from storage")
        
        // Withdraw the bet amount from the child's TSHOT vault.
        let bet <- childVaultRef.withdraw(amount: betAmount)
        
        // Commit the bet and receive a Receipt.
        let receipt <- TSHOTExchange.commitSwap(bet: <-bet)
        
        // Deposit the receipt into the child's storage.
        // We assume your HybridCustody.Manager provides a helper for this.
        managerRef.depositReceipt(
            child: childAddress,
            receipt: <-receipt,
            // You may pass additional parameters if needed, such as the storage path to use.
            receiptStoragePath: TSHOTExchange.ReceiptStoragePath,
            receiptPublicPath: /public/TSHOTReceipt
        )
    }

    execute {
        log("Child commit complete: Receipt deposited in child storage and public capability issued if needed.")
    }
}
