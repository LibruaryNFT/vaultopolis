import "FlowIDTableStaking"

// This script gets all the networking addresses of access nodes
access(all) fun main(): [String] {
    // Get all registered node IDs
    let allNodeIDs = FlowIDTableStaking.getNodeIDs()

    var networkingAddresses: [String] = []

    for nodeID in allNodeIDs {
        // Create a node info instance
        let nodeInfo = FlowIDTableStaking.NodeInfo(nodeID: nodeID)

        // Check if it's an access node
        if nodeInfo.role == UInt8(5) {
            networkingAddresses.append(nodeInfo.networkingAddress)
        }
    }

    return networkingAddresses
}
