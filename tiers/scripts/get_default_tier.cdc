import "TopShotTiers"

access(all) fun main(setID: UInt32): String? {
    if let setData = TopShotTiers.setTiers[setID] {
        if let defaultTier = setData.defaultTier {
            return TopShotTiers.tierToString(tier: defaultTier)
        }
    }
    return nil
}
