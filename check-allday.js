// Quick test to check AllDay NFT IDs
const fcl = require('@onflow/fcl');

// Configure FCL for mainnet
fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

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

const getAllDayCollectionCount = `
import AllDay from 0xe4cf4bdc1751c65d

access(all) fun main(account: Address): UInt64 {
    let account = getAccount(account)
    let collectionRef = account
        .capabilities
        .borrow<&AllDay.Collection>(/public/AllDayNFTCollection)!
    
    return UInt64(collectionRef.getIDs().length)
}
`;

async function checkAllDayCollection() {
  const address = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Checking AllDay collection for: ${address}`);
    console.log('='.repeat(50));
    
    // 1. Get total count
    console.log('1. Getting total count...');
    const count = await fcl.query({
      cadence: getAllDayCollectionCount,
      args: (arg, t) => [arg(address, t.Address)],
    });
    console.log(`   Total NFTs: ${count}`);
    
    // 2. Get all IDs
    console.log('\n2. Getting all NFT IDs...');
    const ids = await fcl.query({
      cadence: getAllDayCollectionIDs,
      args: (arg, t) => [arg(address, t.Address)],
    });
    console.log(`   IDs returned: ${ids.length}`);
    
    if (ids.length !== count) {
      console.log(`   ❌ MISMATCH! Expected ${count}, got ${ids.length}`);
      console.log(`   Missing: ${count - ids.length} NFTs`);
    } else {
      console.log(`   ✅ Perfect match!`);
    }
    
    // 3. Show some sample IDs
    if (ids.length > 0) {
      console.log('\n3. Sample NFT IDs:');
      console.log(`   First 10: ${ids.slice(0, 10).join(', ')}`);
      console.log(`   Last 10: ${ids.slice(-10).join(', ')}`);
      
      // Check for patterns
      const sortedIds = [...ids].sort((a, b) => a - b);
      console.log(`   Range: ${sortedIds[0]} to ${sortedIds[sortedIds.length - 1]}`);
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllDayCollection();
