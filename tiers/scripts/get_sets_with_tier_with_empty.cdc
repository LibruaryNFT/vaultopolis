import "TopShotTiers"
import "TopShot"

// This script retrieves all sets with their default tier and playID-specific tiers, including empty sets.
access(all) fun main(): [{UInt32: {String: AnyStruct}}] {
    let setsResult: [{UInt32: {String: AnyStruct}}] = []

    // Get the total number of setIDs from TopShot
    let nextSetID = TopShot.nextSetID

    // Initialize the starting setID (from 1 instead of 0)
    var currentSetID: UInt32 = 1

    // Iterate through all setIDs from 1 to nextSetID - 1
    while currentSetID < nextSetID {
        var defaultTier: String = "None"
        var playIDTiers: {UInt32: String} = {}

        // Check if the set exists in TopShotTiers
        if let setData = TopShotTiers.setTiers[currentSetID] {
            // Handle default tier
            if setData.defaultTier != nil {
                defaultTier = TopShotTiers.tierToString(tier: setData.defaultTier!)
            }

            // Map the playID-specific tiers
            for playID in setData.playIDTiers.keys {
                let tier = setData.playIDTiers[playID]!
                playIDTiers[playID] = TopShotTiers.tierToString(tier: tier)
            }
        }

        // Add the set's data to the result
        setsResult.append({
            currentSetID: {
                "defaultTier": defaultTier,
                "playIDTiers": playIDTiers
            }
        })

        // Increment the setID
        currentSetID = currentSetID + 1
    }

    return setsResult
}
