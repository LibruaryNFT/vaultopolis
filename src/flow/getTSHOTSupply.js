export const getTSHOTSupply = `

import TSHOT from 0x05b67ba314000b2d

access(all) fun main(): UFix64 {
    return TSHOT.totalSupply
}

`;
