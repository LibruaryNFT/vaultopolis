import "TopShot"

access(all) fun main(setID: UInt32): String? {
    return TopShot.getSetName(setID: setID)
}
