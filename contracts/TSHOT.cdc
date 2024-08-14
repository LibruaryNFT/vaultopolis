import "FungibleToken"
import "TopShot" 

access(all)
contract TSHOT: FungibleToken {

    access(all)
    var totalSupply: UFix64
    access(all)
    let admin: Address

    // Events required by the FungibleToken interface
    access(all)
    event TokensInitialized(initialSupply: UFix64)

    access(all)
    event TokensWithdrawn(amount: UFix64, from: Address?)

    access(all)
    event TokensDeposited(amount: UFix64, to: Address?)

    // Event to log minting of TSHOT tokens
    access(all)
    event TokensMinted(amount: UFix64, to: Address)

    access(all)
    resource Vault: FungibleToken.Provider, FungibleToken.Receiver, FungibleToken.Balance {
        access(all)
        var balance: UFix64

        init(balance: UFix64) {
            self.balance = balance
        }

        access(all)
        fun withdraw(amount: UFix64): @FungibleToken.Vault {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: nil)
            return <-create Vault(balance: amount)
        }

        access(all)
        fun deposit(from: @FungibleToken.Vault) {
            self.balance = self.balance + from.balance
            emit TokensDeposited(amount: from.balance, to: nil)
            destroy from
        }

        access(all)
        view fun getBalance(): UFix64 {
            return self.balance
        }
    }

    access(all)
    fun createVault(initialBalance: UFix64): @Vault {
        return <-create Vault(balance: initialBalance)
    }

    access(all)
    fun createEmptyVault(): @FungibleToken.Vault {
        return <-create Vault(balance: 0.0)
    }

    // Function to mint TSHOT tokens (admin only)
    access(all)
    fun adminMintTokens(to: &Vault, amount: UFix64) {
        pre {
            AuthAccount(payer: self.account).address == self.admin: "Only admin can mint tokens"
        }
        to.deposit(from: <-create Vault(balance: amount))

        // Update the total supply
        self.totalSupply = self.totalSupply + amount

        // Emit an event to log the minting
        emit TokensMinted(amount: amount, to: to.owner?.address ?? panic("Vault has no owner"))
    }

    init() {
        self.totalSupply = 0.0
        self.admin = AuthAccount(payer: self.account).address
        emit TokensInitialized(initialSupply: self.totalSupply)

        // Set up the deployer's account with a Vault
        let vault <- self.createVault(initialBalance: 0.0)
        self.account.save(<-vault, to: /storage/tshotVault)

        // Create a storage capability
        let cap = self.account.capabilities.storage.issue<&TSHOT.Vault>(/storage/tshotVault)

        // Publish the storage capability to a public path
        self.account.capabilities.publish(cap, at: /public/tshotReceiver)
    }
}
