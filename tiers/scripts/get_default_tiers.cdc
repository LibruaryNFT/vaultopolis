import "TopShotTiers"

access(all) fun main(): {UInt32: String} {
    // Get defaultTiers
    return TopShotTiers.getDefaultTiers()
}