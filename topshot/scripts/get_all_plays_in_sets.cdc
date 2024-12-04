import "TopShot"

// This script takes an array of set IDs and returns a dictionary where the keys are set IDs 
// and the values are arrays of play IDs in the corresponding set.

// Parameters:
// - setIDs: [UInt32] - An array of set IDs to query.
//
// Returns: {String: [UInt32]}
// Dictionary of set IDs to arrays of play IDs in each set, formatted as JSON.

access(all) fun main(setIDs: [UInt32]): {String: [UInt32]} {
    let allPlays: {String: [UInt32]} = {}

    // Iterate over each set ID and get the plays
    for setID in setIDs {
        let plays = TopShot.getPlaysInSet(setID: setID)!
        allPlays[setID.toString()] = plays
    }

    return allPlays
}