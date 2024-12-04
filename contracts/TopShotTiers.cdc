import "TopShot"

access(all)
contract TopShotTiers {

    // Define valid tiers as an enum
    access(all)
    enum Tier: UInt8 {
        access(all) case common
        access(all) case fandom
        access(all) case rare
        access(all) case legendary
        access(all) case ultimate
    }

    // Struct to hold tier information for a set
    access(all)
    struct SetData {
        access(all) var defaultTier: Tier?
        access(all) var playIDTiers: {UInt32: Tier}

        init(defaultTier: Tier?, playIDTiers: {UInt32: Tier}) {
            self.defaultTier = defaultTier
            self.playIDTiers = playIDTiers
        }
    }

    // Unified mapping for all set data
    access(all)
    var setTiers: {UInt32: SetData}

    access(all)
    resource interface AdminPublic {
        access(all)
        fun addOrUpdateDefaultTier(setID: UInt32, tier: Tier?)
        access(all)
        fun addOrUpdatePlayIDTier(setID: UInt32, playID: UInt32, tier: Tier)
        access(all)
        fun removePlayIDTier(setID: UInt32, playID: UInt32)
    }

    // Admin resource to manage the tier mappings
    access(all)
    resource Admin: AdminPublic {

        // Add or update the default tier for a set
        access(all)
        fun addOrUpdateDefaultTier(setID: UInt32, tier: Tier?) {
            pre {
                TopShot.isSetLocked(setID: setID) == true: "Default tier can only be set for locked sets"
            }

            if let setData = TopShotTiers.setTiers[setID] {
                TopShotTiers.setTiers[setID] = SetData(
                    defaultTier: tier,
                    playIDTiers: setData.playIDTiers
                )
            } else {
                TopShotTiers.setTiers[setID] = SetData(defaultTier: tier, playIDTiers: {})
            }
        }

        // Add or update a tier for a specific playID in a set
        access(all)
        fun addOrUpdatePlayIDTier(setID: UInt32, playID: UInt32, tier: Tier) {
            if let setData = TopShotTiers.setTiers[setID] {
                var updatedTiers = setData.playIDTiers
                updatedTiers[playID] = tier
                TopShotTiers.setTiers[setID] = SetData(
                    defaultTier: setData.defaultTier,
                    playIDTiers: updatedTiers
                )
            } else {
                TopShotTiers.setTiers[setID] = SetData(defaultTier: nil, playIDTiers: {playID: tier})
            }
        }

        // Remove a specific playID tier
        access(all)
        fun removePlayIDTier(setID: UInt32, playID: UInt32) {
            if let setData = TopShotTiers.setTiers[setID] {
                var updatedTiers = setData.playIDTiers
                updatedTiers.remove(key: playID)
                TopShotTiers.setTiers[setID] = SetData(
                    defaultTier: setData.defaultTier,
                    playIDTiers: updatedTiers
                )
            }
        }
    }

    // Helper function to get the tier of a TopShot moment based on its setID and playID
    access(all)
    fun getTier(nft: &TopShot.NFT): Tier? {
        let setID = nft.data.setID
        let playID = nft.data.playID

        if let setData = self.setTiers[setID] {
            if let playIDTier = setData.playIDTiers[playID] {
                return playIDTier
            }
            return setData.defaultTier // Return default tier if no specific playID tier is found
        }
        return nil
    }

    // Function to convert a `Tier` to a string representation
    access(all)
    fun tierToString(tier: Tier): String {
        switch tier {
        case Tier.ultimate:
            return "ultimate"
        case Tier.legendary:
            return "legendary"
        case Tier.rare:
            return "rare"
        case Tier.common:
            return "common"
        case Tier.fandom:
            return "fandom"
        }
        return "unknown" // Default return to handle all cases
    }

    init() {
        self.setTiers = {}
        self.account.storage.save<@Admin>(<-create Admin(), to: /storage/TopShotTiersAdmin)
        let cap = self.account.capabilities.storage.issue<&TopShotTiers.Admin>(/storage/TopShotTiersAdmin)
        self.account.capabilities.publish(cap, at: /public/TopShotTiersAdmin)
    }
}
