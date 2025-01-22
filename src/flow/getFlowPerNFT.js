export const getFlowPricePerNFT = `

import TopShotFloors from 0x68b53c4a123f2baf

access(all) fun main(): UFix64 {
    // Return the current flowPerNFT value
    return TopShotFloors.getFlowPerNFT()
}

`;
