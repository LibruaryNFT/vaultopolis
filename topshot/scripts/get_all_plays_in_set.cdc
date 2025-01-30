import "TopShot"

// This script returns a dictionary where the keys are set IDs 
// and the values are arrays of play IDs that are in the corresponding set

// Returns: {String: [UInt32]}
// Dictionary of set IDs to arrays of play IDs in each set, formatted as JSON

access(all) fun main(): {String: [UInt32]} {
    let allPlays: {String: [UInt32]} = {}

    // Manually query each set and add to the dictionary
    let setIDs: [UInt32] = [
        164,165,166,167,168,169,170,171,172,173,174,175,176,177
    ]

    // Iterate over each set ID and get the plays
    for setID in setIDs {
        let plays = TopShot.getPlaysInSet(setID: setID)!
        allPlays[setID.toString()] = plays
    }

    return allPlays
}