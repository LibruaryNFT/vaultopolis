// Check AllDay collection using the official CollectionPublicPath
const fcl = require('@onflow/fcl');

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

const getAllDayCollectionCountOfficial = `
import NonFungibleToken from 0x1d7e57aa55817448
import AllDay from 0xe4cf4bdc1751c65d

// This script returns the size of an account's AllDay collection.

access(all) fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = getAccount(address).capabilities.borrow<&AllDay.Collection>(AllDay.CollectionPublicPath)
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs().length
}
`;

const getAllDayCollectionIDsOfficial = `
import NonFungibleToken from 0x1d7e57aa55817448
import AllDay from 0xe4cf4bdc1751c65d

// This script returns all NFT IDs from an account's AllDay collection.

access(all) fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = getAccount(address).capabilities.borrow<&AllDay.Collection>(AllDay.CollectionPublicPath)
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs()
}
`;

async function checkOfficialPath() {
  const address = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Checking AllDay collection using official CollectionPublicPath for: ${address}`);
    console.log('='.repeat(70));
    
    // 1. Get count using official path
    console.log('1. Getting count using AllDay.CollectionPublicPath...');
    const count = await fcl.query({
      cadence: getAllDayCollectionCountOfficial,
      args: (arg, t) => [arg(address, t.Address)],
    });
    console.log(`   Count: ${count}`);
    
    // 2. Get all IDs using official path
    console.log('\n2. Getting all NFT IDs using AllDay.CollectionPublicPath...');
    const ids = await fcl.query({
      cadence: getAllDayCollectionIDsOfficial,
      args: (arg, t) => [arg(address, t.Address)],
    });
    console.log(`   IDs returned: ${ids.length}`);
    
    if (ids.length !== count) {
      console.log(`   ❌ MISMATCH! Expected ${count}, got ${ids.length}`);
    } else {
      console.log(`   ✅ Perfect match!`);
    }
    
    // 3. Show sample data
    if (ids.length > 0) {
      console.log('\n3. Sample NFT IDs:');
      console.log(`   First 10: ${ids.slice(0, 10).join(', ')}`);
      console.log(`   Last 10: ${ids.slice(-10).join(', ')}`);
      
      const sortedIds = [...ids].sort((a, b) => a - b);
      console.log(`   Range: ${sortedIds[0]} to ${sortedIds[sortedIds.length - 1]}`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 RESULTS:');
    console.log(`   Official CollectionPublicPath: ${count} NFTs`);
    console.log(`   Previous hardcoded path: 199 NFTs`);
    
    if (count === 2614) {
      console.log(`   ✅ PERFECT MATCH! Found all ${count} NFTs using the official path!`);
      console.log(`   🎉 This explains the discrepancy - we were using the wrong path!`);
    } else if (count > 199) {
      console.log(`   🔍 Found ${count} NFTs (more than the 199 from hardcoded path)`);
      console.log(`   Still missing: ${2614 - count} NFTs`);
    } else {
      console.log(`   ❌ Still only ${count} NFTs, expected 2614`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n💡 This might mean:');
    console.log('   1. The AllDay contract is not deployed at the expected address');
    console.log('   2. The CollectionPublicPath is different');
    console.log('   3. There\'s a different AllDay contract version');
  }
}

checkOfficialPath();
