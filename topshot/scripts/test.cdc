access(all) fun main(): UInt64 {
    // Generate a random number
    let randNumber: UInt64 = revertibleRandom<UInt64>()

    // Return the random number
    return randNumber
}