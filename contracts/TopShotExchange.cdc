import "FungibleToken"
import "NonFungibleToken" 
import "TopShot"
import "TopShotTiers"
import "TSHOT"

pub contract TopShotExchange {

    // Define resource interfaces for modularity and upgradability
    pub resource interface IExchange {
        pub fun swapCommonMomentsForTokens(userCollection: Capability<&TopShot.Collection>, momentIDs: [UInt64]): UFix64
    }

    // Define the main exchange resource
    pub resource Exchange: IExchange {
        pub let tshotVault: &TSHOT.Vault

        init(tshotVault: &TSHOT.Vault) {
            self.tshotVault = tshotVault
        }

        pub fun swapCommonMomentsForTokens(userCollection: Capability<&TopShot.Collection>, momentIDs: [UInt64]): UFix64 {
            let collectionRef = userCollection.borrow()
                ?? panic("Could not borrow the user's collection reference")

            var totalAmount: UFix64 = 0.0

            for momentID in momentIDs {
                let moment <- collectionRef.withdraw(withdrawID: momentID) as! @TopShot.NFT
                let tier = TopShotTiers.getTier(nft: &moment as &TopShot.NFT)

                if tier == TopShotTiers.Tier.common {
                    self.tshotVault.deposit(from: <-TSHOT.createNewTokens(amount: 1.0))
                    totalAmount = totalAmount + 1.0
                    destroy moment
                } else {
                    // Return non-common moments back to the user's collection
                    collectionRef.deposit(token: <-moment)
                }
            }
            return totalAmount
        }
    }

    pub fun createExchange(tshotVault: &TSHOT.Vault): @Exchange {
        return <- create Exchange(tshotVault: tshotVault)
    }
}
