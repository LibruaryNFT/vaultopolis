import "TopShot"

// This script returns a dictionary where the keys are set IDs 
// and the values are arrays of play IDs that are in the corresponding set

// This script fetches all sets and their associated plays by incrementally querying set IDs

access(all) fun main(): {UInt32: [UInt32]} {
    let allPlays: {UInt32: [UInt32]} = {}
    var currentSetID: UInt32 = 1

    // Iterate over possible set IDs
    while true {
        let setData = TopShot.getSetData(setID: currentSetID)
        if setData == nil {
            // Break the loop if the setID doesn't exist
            break
        }

        // Retrieve the plays for this set ID
        let plays = TopShot.getPlaysInSet(setID: currentSetID) ?? []
        allPlays[currentSetID] = plays

        // Increment to check the next set ID
        currentSetID = currentSetID + 1
    }

    return allPlays
}