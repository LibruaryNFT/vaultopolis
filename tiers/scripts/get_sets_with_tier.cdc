import "TopShotTiers"

// This script retrieves all sets with their default tier and playID-specific tiers.
access(all) fun main(): [{UInt32: {String: AnyStruct}}] {
    let setsResult: [{UInt32: {String: AnyStruct}}] = []

    // Iterate through all sets in the setTiers dictionary
    for setID in TopShotTiers.setTiers.keys {
        let setData = TopShotTiers.setTiers[setID]!

        // Handle the default tier
        let defaultTier: String = setData.defaultTier != nil 
            ? TopShotTiers.tierToString(tier: setData.defaultTier!) 
            : "None"

        let playIDTiers: {UInt32: String} = {}

        // Map the playID-specific tiers, handling optional tiers
        for playID in setData.playIDTiers.keys {
            let tier = setData.playIDTiers[playID]!
            playIDTiers[playID] = TopShotTiers.tierToString(tier: tier)
        }

        // Add this set's data to the result
        setsResult.append({
            setID: {
                "defaultTier": defaultTier,
                "playIDTiers": playIDTiers
            }
        })
    }

    return setsResult
}
