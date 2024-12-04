import "TopShotTiers"

access(all) fun main(setID: UInt32): {UInt32: String}? {
    if let setData = TopShotTiers.setTiers[setID] {
        var result: {UInt32: String} = {}
        for playID in setData.playIDTiers.keys {
            result[playID] = TopShotTiers.tierToString(tier: setData.playIDTiers[playID]!)
        }
        return result
    }
    return nil
}
