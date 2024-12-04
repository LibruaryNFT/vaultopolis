import "FlowIDTableStaking"

//0x9eca2b38b18b5dfe

// This script gets all the access nodes and their information
access(all) fun main(): [FlowIDTableStaking.NodeInfo] {
    // Get all registered node IDs
    let allNodeIDs = FlowIDTableStaking.getNodeIDs()

    var accessNodeList: [FlowIDTableStaking.NodeInfo] = []

    for nodeID in allNodeIDs {
        // Create a node info instance
        let nodeInfo = FlowIDTableStaking.NodeInfo(nodeID: nodeID)

        // Check if it's an access node
        if nodeInfo.role == UInt8(5) {
            accessNodeList.append(nodeInfo)
        }
    }

    return accessNodeList
}