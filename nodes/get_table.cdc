import FlowIDTableStaking from 0x8624b52f9ddcd04a

// This script returns the current identity table length

access(all) fun main(): [String] {
    return FlowIDTableStaking.getNodeIDs()
}