import SwapFactory from 0xb063c16cac85dbd1

access(all) fun main(): UFix64 {
    // 1) Explicitly call getPairInfo with named arguments
    //    Make sure the strings exactly match how IncrementFi expects them.
    let info = SwapFactory.getPairInfo(
        token0Key: "A.1654653399040a61.FlowToken", 
        token1Key: "A.05b67ba314000b2d.TSHOT"
    )

    // If pair doesn't exist => nil
    if info == nil {
        return 0.0
    }

    // 2) Cast the returned AnyStruct to an array of AnyStruct
    //    According to docs, shape is:
    //    [
    //      token0Key,        (String)
    //      token1Key,        (String)
    //      token0Balance,    (UFix64)
    //      token1Balance,    (UFix64)
    //      pairAddress,      (Address)
    //      lpTokenBalance,   (UFix64)
    //      swapFeeBps,       (UFix64)
    //      isStableswap,     (Bool)
    //      stableCurveP      (UFix64)
    //    ]
    let arr = info! as! [AnyStruct]

    // 3) Extract fields
    let token0Key = arr[0] as! String
    let token1Key = arr[1] as! String
    let token0Balance = arr[2] as! UFix64
    let token1Balance = arr[3] as! UFix64
    // We won't parse pairAddr (arr[4]), lpTokenBalance (arr[5]), etc. here

    // 4) Identify which token is TSHOT vs. FLOW
    //    "1 TSHOT = X FLOW" => ratio = flowReserve / tshotReserve
    if token0Key == "A.05b67ba314000b2d.TSHOT" 
       && token1Key == "A.1654653399040a61.FlowToken" 
    {
        // TSHOT is token0, Flow is token1
        if token0Balance == 0.0 {
            return 0.0
        }
        return token1Balance / token0Balance

    } else if token0Key == "A.1654653399040a61.FlowToken" 
              && token1Key == "A.05b67ba314000b2d.TSHOT" 
    {
        // Flow is token0, TSHOT is token1
        if token1Balance == 0.0 {
            return 0.0
        }
        return token0Balance / token1Balance

    } else {
        // The pair is something else entirely, 
        // or you spelled the keys incorrectly
        return 0.0
    }
}
