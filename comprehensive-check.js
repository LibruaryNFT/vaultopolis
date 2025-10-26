// Comprehensive AllDay collection check
const fcl = require('@onflow/fcl');

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

const checkAllAllDayCollections = `
import AllDay from 0xe4cf4bdc1751c65d

access(all) fun main(account: Address): {String: UInt64} {
    let account = getAccount(account)
    
    var result: {String: UInt64} = {}
    
    // Check main collection
    if let collectionRef = account.capabilities.borrow<&AllDay.Collection>(/public/AllDayNFTCollection) {
        result["AllDayNFTCollection"] = UInt64(collectionRef.getIDs().length)
    }
    
    // Check if there are other collection paths
    let publicPaths = account.capabilities.keys
    for path in publicPaths {
        if path.identifier == "AllDayNFTCollection" {
            if let collectionRef = account.capabilities.borrow<&AllDay.Collection>(path) {
                result["AllDayNFTCollection_" + path.toString()] = UInt64(collectionRef.getIDs().length)
            }
        }
    }
    
    return result
}
`;

const getAllDayCollectionIDs = `
import AllDay from 0xe4cf4bdc1751c65d

access(all) fun main(account: Address): [UInt64] {
    let account = getAccount(account)
    let collectionRef = account
        .capabilities
        .borrow<&AllDay.Collection>(/public/AllDayNFTCollection)!
    
    return collectionRef.getIDs()
}
`;

async function comprehensiveCheck() {
  const address = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Comprehensive AllDay check for: ${address}`);
    console.log('='.repeat(60));
    
    // 1. Check all AllDay collections
    console.log('1. Checking all AllDay collections...');
    const collections = await fcl.query({
      cadence: checkAllAllDayCollections,
      args: (arg, t) => [arg(address, t.Address)],
    });
    
    console.log('   Collections found:');
    for (const [name, count] of Object.entries(collections)) {
      console.log(`   - ${name}: ${count} NFTs`);
    }
    
    // 2. Get detailed info about the main collection
    console.log('\n2. Detailed analysis of main collection...');
    const ids = await fcl.query({
      cadence: getAllDayCollectionIDs,
      args: (arg, t) => [arg(address, t.Address)],
    });
    
    console.log(`   Total IDs: ${ids.length}`);
    
    if (ids.length > 0) {
      const sortedIds = [...ids].sort((a, b) => a - b);
      console.log(`   ID Range: ${sortedIds[0]} to ${sortedIds[sortedIds.length - 1]}`);
      console.log(`   First 5: ${sortedIds.slice(0, 5).join(', ')}`);
      console.log(`   Last 5: ${sortedIds.slice(-5).join(', ')}`);
      
      // Check for gaps
      let gaps = 0;
      for (let i = 1; i < sortedIds.length; i++) {
        if (sortedIds[i] - sortedIds[i-1] > 1) {
          gaps++;
        }
      }
      console.log(`   Gaps in sequence: ${gaps}`);
    }
    
    // 3. Check account capabilities
    console.log('\n3. Checking account capabilities...');
    const accountInfoScript = `
    access(all) fun main(account: Address): [String] {
        let account = getAccount(account)
        let paths = account.capabilities.keys
        var result: [String] = []
        for path in paths {
            result.append(path.identifier)
        }
        return result
    }
    `;
    
    const capabilities = await fcl.query({
      cadence: accountInfoScript,
      args: (arg, t) => [arg(address, t.Address)],
    });
    
    console.log('   Account capabilities:');
    capabilities.forEach(cap => {
      if (cap.includes('AllDay') || cap.includes('Collection')) {
        console.log(`   - ${cap}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SUMMARY:');
    console.log(`   Main collection: ${collections.AllDayNFTCollection || 0} NFTs`);
    console.log(`   Total collections: ${Object.keys(collections).length}`);
    
    if (collections.AllDayNFTCollection < 2614) {
      console.log(`   ❌ ISSUE: Only ${collections.AllDayNFTCollection} NFTs found, expected 2614`);
      console.log(`   Missing: ${2614 - collections.AllDayNFTCollection} NFTs`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

comprehensiveCheck();

