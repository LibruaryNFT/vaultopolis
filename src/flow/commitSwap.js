export const commitSwap = `

import FungibleToken from 0x9a0766d93b6608b7
import TSHOT from 0x332ffc0ae9bba9c1

import MomentSwapTSHOT from 0x332ffc0ae9bba9c1

/// Commits the defined amount of Flow as a bet to the CoinToss contract, saving the returned Receipt to storage
///
transaction(betAmount: UFix64) {

    prepare(signer: auth(BorrowValue, SaveValue) &Account) {
        // Withdraw my bet amount from my FlowToken vault
        let tshotVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &TSHOT.Vault>(from: /storage/TSHOTTokenVault)!
        let bet <- tshotVault.withdraw(amount: betAmount)
        
        // Commit my bet and get a receipt
        let receipt <- MomentSwapTSHOT.commitSwap(bet: <-bet)
        
        // Check that I don't already have a receipt stored
        if signer.storage.type(at: MomentSwapTSHOT.ReceiptStoragePath) != nil {
            panic("Storage collision at path=".concat(MomentSwapTSHOT.ReceiptStoragePath.toString()).concat(" a Receipt is already stored!"))
        }

        // Save that receipt to my storage
        // Note: production systems would consider handling path collisions
        signer.storage.save(<-receipt, to: MomentSwapTSHOT.ReceiptStoragePath)
    }
}

`;
