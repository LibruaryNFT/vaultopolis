import "FungibleToken"

access(all) contract TSHOTR: FungibleToken {

    // Total supply of Flow tokens in existence
    access(all) var totalSupply: UFix64

    // Paths
    access(all) let tokenBalancePath: PublicPath
    access(all) let tokenReceiverPath: PublicPath

    // Event that is emitted when the contract is created
    access(all) event TokensInitialized(initialSupply: UFix64)

    // Event that is emitted when tokens are withdrawn from a Vault
    access(all) event TokensWithdrawn(amount: UFix64, from: Address?)

    // Event that is emitted when tokens are deposited to a Vault
    access(all) event TokensDeposited(amount: UFix64, to: Address?)

    // Event that is emitted when new tokens are minted
    access(all) event TokensMinted(amount: UFix64)

    // Event that is emitted when tokens are destroyed
    access(all) event TokensBurned(amount: UFix64)

    // Define Admin Entitlement
    access(all) entitlement AdminEntitlement

    // Vault
    //
    // Each user stores an instance of only the Vault in their storage
    // The functions in the Vault and governed by the pre and post conditions
    // in FungibleToken when they are called.
    // The checks happen at runtime whenever a function is called.
    //
    // Resources can only be created in the context of the contract that they
    // are defined in, so there is no way for a malicious user to create Vaults
    // out of thin air. A special Minter resource needs to be defined to mint
    // new tokens.
    access(all) resource Vault: FungibleToken.Vault {

        // Holds the balance of a user's tokens
        access(all) var balance: UFix64

        // Initialize the balance at resource creation time
        init(balance: UFix64) {
            self.balance = balance
        }

        /// Called when this TSHOTR vault is burned via the `Burner.burn()` method
        access(contract) fun burnCallback() {
            if self.balance > 0.0 {
                TSHOTR.totalSupply = TSHOTR.totalSupply - self.balance
            }
            self.balance = 0.0
        }

        /// getSupportedVaultTypes optionally returns a list of vault types that this receiver accepts
        access(all) view fun getSupportedVaultTypes(): {Type: Bool} {
            return {self.getType(): true}
        }

        access(all) view fun isSupportedVaultType(type: Type): Bool {
            return type == self.getType()
        }

        /// Asks if the amount can be withdrawn from this vault
        access(all) view fun isAvailableToWithdraw(amount: UFix64): Bool {
            return amount <= self.balance
        }

        /// Added simply to conform to FT-V2 interface.
        access(all) view fun getViews(): [Type] { return [] }
        access(all) fun resolveView(_ view: Type): AnyStruct? { return nil }

        // withdraw
        //
        // Function that takes an integer amount as an argument
        // and withdraws that amount from the Vault.
        // It creates a new temporary Vault that is used to hold
        // the money that is being transferred. It returns the newly
        // created Vault to the context that called so it can be deposited
        // elsewhere.
        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        // deposit
        //
        // Function that takes a Vault object as an argument and adds
        // its balance to the balance of the owner's Vault.
        // It is allowed to destroy the sent Vault because the Vault
        // was a temporary holder of the tokens. The Vault's balance has
        // been consumed and therefore can be destroyed.
        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @TSHOTR.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }

        access(all) fun createEmptyVault(): @{FungibleToken.Vault} {
            return <-create Vault(balance: 0.0)
        }
    }

    // createEmptyVault
    //
    // Function that creates a new Vault with a balance of zero
    // and returns it to the calling context. A user must call this function
    // and store the returned Vault in their storage in order to allow their
    // account to be able to receive deposits of this token type.
    access(all) fun createEmptyVault(vaultType: Type): @TSHOTR.Vault {
        return <-create Vault(balance: 0.0)
    }

    /// Added simply to conform to FT-V2 interface.
    access(all) view fun getContractViews(resourceType: Type?): [Type] { return [] }
    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? { return nil }

    // Mint tokens
    //
    // $TSHOT token can only be minted by the TopShotExchange contract.
    // This function allows the TopShotExchange contract to mint tokens 
    // in exchange for a user's NFT.

    // Admin resource definition with entitlement applied to the function
    access(all) resource Admin {

        // Function to update the Flow per NFT value with entitlement
        access(AdminEntitlement) fun mintTokens(amount: UFix64): @TSHOTR.Vault {
        TSHOTR.totalSupply = TSHOTR.totalSupply + amount
        emit TokensMinted(amount: amount)
        return <-create Vault(balance: amount)
    }
    }
    
    // Burn tokens
    //
    // $TSHOTR token will be burned in exchange for underlying $FLOW when a user requests to unstake from the liquid staking protocol.
    // Note: the burned tokens are automatically subtracted from the total supply in the Vault destructor.
    access(account) fun burnTokens(from: @TSHOTR.Vault) {
        let amount = from.balance
        TSHOTR.totalSupply = TSHOTR.totalSupply - amount
        destroy from
        emit TokensBurned(amount: amount)
    }


    // Initialization function
    init() {
        self.totalSupply = 0.0

        self.tokenReceiverPath = /public/TSHOTRTokenReceiver
        self.tokenBalancePath = /public/TSHOTRTokenBalance

        // Put a new Collection in storage
        self.account.storage.save<@Admin>(<- create Admin(), to: /storage/TSHOTRAdmin)

        // Emit an event that shows that the contract was initialized
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
