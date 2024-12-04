import FlowIDTableStaking from 0x8624b52f9ddcd04a

access(all) fun main(): [String] {
    // Get all registered node IDs
    let allNodeIDs = FlowIDTableStaking.getNodeIDs()

    var accessNodeList: [String] = []

    for nodeID in allNodeIDs {
        // Create a node info instance
        let nodeInfo = FlowIDTableStaking.NodeInfo(nodeID: nodeID)

        // Check if it's an access node
        if nodeInfo.role == UInt8(5) {
            accessNodeList.append(nodeID)
        }
    }

    return accessNodeList
}
