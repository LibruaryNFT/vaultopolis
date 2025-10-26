// Check different AllDay collection paths
const fcl = require('@onflow/fcl');

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

const checkPath = `
import AllDay from 0xe4cf4bdc1751c65d

access(all) fun main(account: Address, pathIdentifier: String): UInt64 {
    let account = getAccount(account)
    
    // Try to borrow from the specified path
    if let collectionRef = account.capabilities.borrow<&AllDay.Collection>(/public/{pathIdentifier}) {
        return UInt64(collectionRef.getIDs().length)
    }
    
    return 0
}
`;

async function checkAllDayPaths() {
  const address = "0x58bdc3d07e83ba18";
  
  // Common AllDay collection path identifiers to check
  const pathsToCheck = [
    "AllDayNFTCollection",
    "AllDayCollection", 
    "NFTCollection",
    "Collection",
    "AllDay",
    "AllDayNFT",
    "AllDayMoments",
    "Moments",
    "AllDayCollectionPublic",
    "AllDayNFTCollectionPublic",
    "AllDayNFTCollectionV2",
    "AllDayCollectionV2",
    "AllDayNFTCollectionMain",
    "AllDayCollectionMain",
    "AllDayNFTCollectionBeta",
    "AllDayCollectionBeta",
    "AllDayNFTCollectionAlpha",
    "AllDayCollectionAlpha",
    "AllDayNFTCollectionTest",
    "AllDayCollectionTest"
  ];
  
  try {
    console.log(`🔍 Checking AllDay collection paths for: ${address}`);
    console.log('='.repeat(60));
    
    const results = [];
    
    for (const pathIdentifier of pathsToCheck) {
      try {
        const count = await fcl.query({
          cadence: checkPath,
          args: (arg, t) => [
            arg(address, t.Address),
            arg(pathIdentifier, t.String)
          ],
        });
        
        if (count > 0) {
          results.push({ path: pathIdentifier, count });
          console.log(`✅ /public/${pathIdentifier}: ${count} NFTs`);
        }
      } catch (error) {
        // Path doesn't exist or error, skip silently
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SUMMARY:');
    
    if (results.length === 0) {
      console.log('   ❌ No AllDay collections found with any of the tested paths');
      console.log('   💡 The collection might use a completely different path');
    } else {
      console.log(`   Found ${results.length} collection(s):`);
      results.forEach(result => {
        console.log(`   - /public/${result.path}: ${result.count} NFTs`);
      });
      
      const totalNFTs = results.reduce((sum, result) => sum + result.count, 0);
      console.log(`   Total NFTs: ${totalNFTs}`);
      
      if (totalNFTs === 2614) {
        console.log(`   ✅ PERFECT! Found all ${totalNFTs} NFTs`);
      } else if (totalNFTs > 199) {
        console.log(`   🔍 Found ${totalNFTs} NFTs (more than the 199 from /public/AllDayNFTCollection)`);
        console.log(`   Still missing: ${2614 - totalNFTs} NFTs`);
      } else {
        console.log(`   ❌ Still only ${totalNFTs} NFTs, expected 2614`);
        console.log(`   Missing: ${2614 - totalNFTs} NFTs`);
      }
    }
    
    // If we still haven't found 2614, let's try some other approaches
    if (results.length === 0 || results.reduce((sum, result) => sum + result.count, 0) < 2614) {
      console.log('\n💡 NEXT STEPS:');
      console.log('   1. Check if NFTs are in child accounts');
      console.log('   2. Check if there\'s a different AllDay contract');
      console.log('   3. Check if the official site is using a different API');
      console.log('   4. Verify the account address is correct');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllDayPaths();

