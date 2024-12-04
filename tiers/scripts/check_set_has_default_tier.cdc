import "TopShotTiers"

access(all) fun main(setID: UInt32): Bool {
    if let setData = TopShotTiers.setTiers[setID] {
        return setData.defaultTier != nil
    }
    return false
}
