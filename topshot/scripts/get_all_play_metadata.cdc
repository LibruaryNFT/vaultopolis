import "TopShot"

// The script retrieves metadata for a range of Play IDs
pub fun main(startID: UInt32, endID: UInt32): {UInt32: {String: String}} {
    let allPlayMetadata: {UInt32: {String: String}} = {}

    var playID = startID
    while playID <= endID {
        let metadata = TopShot.getPlayMetaData(playID: playID)
        if metadata != nil {
            allPlayMetadata[playID] = metadata!
        }
        playID = playID + 1
    }

    return allPlayMetadata
}