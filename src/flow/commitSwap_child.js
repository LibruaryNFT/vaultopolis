export const commitSwapChild = `
import FungibleToken from 0xf233dcee88fe0abe
import TSHOT from 0x05b67ba314000b2d
import TSHOTExchange from 0x05b67ba314000b2d
import HybridCustody from 0xd8a7e05a7ac670c0

transaction(childAddress: Address, betAmount: UFix64) {

    prepare(signer: auth(BorrowValue, SaveValue, Capabilities) &Account) {

        // ── 50-token limit ────────────────────────────────────────────────
        if betAmount > 50.0 {
            panic("Cannot commit more than 50 TSHOT.")
        }

        // ── borrow child’s vault via HybridCustody ────────────────────────
        let managerRef = signer
            .storage
            .borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("HybridCustody.Manager not found")

        let childAcct   = managerRef.borrowAccount(addr: childAddress)
            ?? panic("Parent lacks access to child account")

        let childVault  = childAcct
            .borrow<&TSHOT.Vault>(from: /storage/TSHOTTokenVault)
            ?? panic("Child TSHOT vault not found")

        let bet <- childVault.withdraw(amount: betAmount)

        let receipt <- TSHOTExchange.commitSwap(
            payer: signer.address,
            bet:   <- bet
        )

        // ── store receipt for the child ──────────────────────────────────
        managerRef.depositReceipt(
            child:              childAddress,
            receipt:            <- receipt,
            receiptStoragePath: TSHOTExchange.ReceiptStoragePath,
            receiptPublicPath:  /public/TSHOTReceipt
        )
    }

    execute {
        log("Child commit complete; receipt saved in child storage.")
    }
}

`;
