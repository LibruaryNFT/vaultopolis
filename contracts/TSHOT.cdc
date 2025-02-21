import "FungibleToken"
import "MetadataViews"
import "FungibleTokenMetadataViews"

access(all) contract TSHOT: FungibleToken {

    // Total supply of TSHOT
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

    // =========================================================================
    //  Vault Resource
    // =========================================================================
    access(all) resource Vault: FungibleToken.Vault {

        // Holds the balance of a user's tokens
        access(all) var balance: UFix64

        // Initialize the balance at resource creation time
        init(balance: UFix64) {
            self.balance = balance
        }

        /// Called when this TSHOT vault is burned via the `Burner.burn()` method
        access(contract) fun burnCallback() {
            if self.balance > 0.0 {
                TSHOT.totalSupply = TSHOT.totalSupply - self.balance
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

        // In fungible tokens, vaults can simply defer calls to the contract views:
        access(all) view fun getViews(): [Type] {
            return TSHOT.getContractViews(resourceType: nil)
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            return TSHOT.resolveContractView(resourceType: nil, viewType: view)
        }

        // withdraw
        //
        // Function that takes an integer amount as an argument
        // and withdraws that amount from the Vault.
        access(FungibleToken.Withdraw) fun withdraw(amount: UFix64): @{FungibleToken.Vault} {
            self.balance = self.balance - amount
            emit TokensWithdrawn(amount: amount, from: self.owner?.address)
            return <-create Vault(balance: amount)
        }

        // deposit
        //
        // Function that takes a Vault object as an argument and adds
        // its balance to the balance of the owner's Vault.
        access(all) fun deposit(from: @{FungibleToken.Vault}) {
            let vault <- from as! @TSHOT.Vault
            self.balance = self.balance + vault.balance
            emit TokensDeposited(amount: vault.balance, to: self.owner?.address)
            vault.balance = 0.0
            destroy vault
        }

        access(all) fun createEmptyVault(): @{FungibleToken.Vault} {
            return <-create Vault(balance: 0.0)
        }
    }

    // =========================================================================
    //  Metadata Views for the Contract
    // =========================================================================

    //
    // Provide standard views so explorers, wallets, and dApps can query info
    //
    access(all) view fun getContractViews(resourceType: Type?): [Type] {
        return [
            Type<FungibleTokenMetadataViews.FTView>(),
            Type<FungibleTokenMetadataViews.FTDisplay>(),
            Type<FungibleTokenMetadataViews.FTVaultData>(),
            Type<FungibleTokenMetadataViews.TotalSupply>()
        ]
    }

    access(all) fun resolveContractView(resourceType: Type?, viewType: Type): AnyStruct? {
        switch viewType {
            case Type<FungibleTokenMetadataViews.FTView>():
                return FungibleTokenMetadataViews.FTView(
                    ftDisplay: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTDisplay>()) 
                        as! FungibleTokenMetadataViews.FTDisplay?,
                    ftVaultData: self.resolveContractView(resourceType: nil, viewType: Type<FungibleTokenMetadataViews.FTVaultData>()) 
                        as! FungibleTokenMetadataViews.FTVaultData?
                )

            case Type<FungibleTokenMetadataViews.FTDisplay>():
                
                let media = MetadataViews.Media(
                    file: MetadataViews.HTTPFile(
                        url: "https://storage.googleapis.com/vaultopolis/TSHOT.png"
                    ),
                    mediaType: "image/png"
                )

                return FungibleTokenMetadataViews.FTDisplay(
                    name: "TSHOT Token",
                    symbol: "TSHOT",
                    description: "TSHOT is a token minted by exchanging Common or Fandom Top Shot Moments.",
                    externalURL: MetadataViews.ExternalURL("https://vaultopolis.com"),
                    logos: MetadataViews.Medias([media]),
                    socials: {
                        "twitter": MetadataViews.ExternalURL("https://twitter.com/Vaultopolis")
                    }
                )

            case Type<FungibleTokenMetadataViews.FTVaultData>():
                
                return FungibleTokenMetadataViews.FTVaultData(
                    storagePath: /storage/TSHOTTokenVault,             
                    receiverPath: self.tokenReceiverPath,
                    metadataPath: self.tokenBalancePath,
                    receiverLinkedType: Type<&TSHOT.Vault>(),
                    metadataLinkedType: Type<&TSHOT.Vault>(),
                    createEmptyVaultFunction: (fun(): @{FungibleToken.Vault} {
                        return <-TSHOT.createEmptyVault(vaultType: Type<@TSHOT.Vault>())
                    })
                )

            case Type<FungibleTokenMetadataViews.TotalSupply>():
                return FungibleTokenMetadataViews.TotalSupply(
                    totalSupply: TSHOT.totalSupply
                )
        }

        return nil
    }

    // =========================================================================
    //  Create Empty Vault
    // =========================================================================
    access(all) fun createEmptyVault(vaultType: Type): @TSHOT.Vault {
        return <-create Vault(balance: 0.0)
    }

    // =========================================================================
    //  Admin resource definition and Minter function
    // =========================================================================
    access(all) resource Admin {
        access(AdminEntitlement) fun mintTokens(amount: UFix64): @TSHOT.Vault {
            TSHOT.totalSupply = TSHOT.totalSupply + amount
            emit TokensMinted(amount: amount)
            return <-create Vault(balance: amount)
        }
    }

    // =========================================================================
    //  Burn Tokens
    // =========================================================================
    access(account) fun burnTokens(from: @TSHOT.Vault) {
        let amount = from.balance
        TSHOT.totalSupply = TSHOT.totalSupply - amount
        destroy from
        emit TokensBurned(amount: amount)
    }

    // =========================================================================
    //  Contract Initialization
    // =========================================================================
    init() {
        self.totalSupply = 0.0

        self.tokenReceiverPath = /public/TSHOTTokenReceiver
        self.tokenBalancePath = /public/TSHOTTokenBalance

        // Put a new Admin in storage
        self.account.storage.save<@Admin>(<- create Admin(), to: /storage/TSHOTAdmin)

        // Emit an event that shows that the contract was initialized
        emit TokensInitialized(initialSupply: self.totalSupply)
    }
}
