import "TopShotTiers"

access(all) fun main(setID: UInt32, playID: UInt32): String? {
    if let setData = TopShotTiers.setTiers[setID] {
        if let playIDTier = setData.playIDTiers[playID] {
            return TopShotTiers.tierToString(tier: playIDTier)
        }
    }
    return nil
}
