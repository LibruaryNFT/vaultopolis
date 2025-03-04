import "TopShot"

// Return an optional UInt32
access(all) fun main(nftID: UInt64): UInt32? {
    return TopShot.getMomentsSubedition(nftID: nftID)
}