export const getFlowPricePerNFT = `

import TopShotFloors from 0xb1788d64d512026d

access(all) fun main(): UFix64 {
    // Return the current flowPerNFT value
    return TopShotFloors.getFlowPerNFT()
}

`;
