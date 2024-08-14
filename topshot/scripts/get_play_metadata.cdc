import "TopShot"

// The script retrieves metadata for a specific Play ID
access(all) fun main(playID: UInt32): {String: String}? {
    let metadata = TopShot.getPlayMetaData(playID: playID)
    return metadata
}