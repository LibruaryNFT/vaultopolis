import "TopShot"

access(all) fun main(): {UInt32: String} {
    let setNames: {UInt32: String} = {}
    var setID: UInt32 = 1

    while true {
        let name = TopShot.getSetName(setID: setID)
        if name == nil {
            break
        }
        setNames[setID] = name!
        setID = setID + 1
    }

    return setNames
}