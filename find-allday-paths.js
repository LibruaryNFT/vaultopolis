// Find all AllDay collection paths
const fcl = require('@onflow/fcl');

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

const findAllAllDayPaths = `
import AllDay from 0xe4cf4bdc1751c65d

access(all) fun main(account: Address): {String: UInt64} {
    let account = getAccount(account)
    
    var result: {String: UInt64} = {}
    
    // Check common AllDay collection paths
    let paths: [StoragePath] = [
        /public/AllDayNFTCollection,
        /public/AllDayCollection,
        /public/NFTCollection,
        /public/Collection,
        /public/AllDay,
        /public/AllDayNFT,
        /public/AllDayMoments,
        /public/Moments,
        /public/AllDayCollectionPublic,
        /public/AllDayNFTCollectionPublic
    ]
    
    for path in paths {
        if let collectionRef = account.capabilities.borrow<&AllDay.Collection>(path) {
            result[path.toString()] = UInt64(collectionRef.getIDs().length)
        }
    }
    
    return result
}
`;

const checkSpecificPath = `
import AllDay from 0xe4cf4bdc1751c65d

access(all) fun main(account: Address, pathString: String): UInt64 {
    let account = getAccount(account)
    
    // Try to parse the path
    let path = StoragePath(identifier: pathString)!
    
    if let collectionRef = account.capabilities.borrow<&AllDay.Collection>(path) {
        return UInt64(collectionRef.getIDs().length)
    }
    
    return 0
}
`;

async function findCorrectPath() {
  const address = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Finding AllDay collection paths for: ${address}`);
    console.log('='.repeat(60));
    
    // 1. Check all common paths
    console.log('1. Checking common AllDay collection paths...');
    const paths = await fcl.query({
      cadence: findAllAllDayPaths,
      args: (arg, t) => [arg(address, t.Address)],
    });
    
    console.log('   Found collections:');
    for (const [path, count] of Object.entries(paths)) {
      console.log(`   - ${path}: ${count} NFTs`);
    }
    
    // 2. If we found multiple paths, check which one has the most NFTs
    const entries = Object.entries(paths);
    if (entries.length > 0) {
      const maxPath = entries.reduce((max, current) => 
        current[1] > max[1] ? current : max
      );
      
      console.log(`\n   🎯 Largest collection: ${maxPath[0]} with ${maxPath[1]} NFTs`);
      
      if (maxPath[1] === 2614) {
        console.log(`   ✅ FOUND IT! This matches your expected count of 2614`);
      } else if (maxPath[1] > 199) {
        console.log(`   🔍 This is larger than the 199 we found before, but still not 2614`);
      }
    }
    
    // 3. Let's also check some other possible paths manually
    console.log('\n2. Checking additional possible paths...');
    const additionalPaths = [
      '/public/AllDayNFTCollection',
      '/public/AllDayCollection', 
      '/public/NFTCollection',
      '/public/Collection',
      '/public/AllDay',
      '/public/AllDayNFT',
      '/public/AllDayMoments',
      '/public/Moments',
      '/public/AllDayCollectionPublic',
      '/public/AllDayNFTCollectionPublic',
      '/public/AllDayNFTCollectionV2',
      '/public/AllDayCollectionV2',
      '/public/AllDayNFTCollectionMain',
      '/public/AllDayCollectionMain'
    ];
    
    for (const pathString of additionalPaths) {
      try {
        const count = await fcl.query({
          cadence: checkSpecificPath,
          args: (arg, t) => [
            arg(address, t.Address),
            arg(pathString, t.String)
          ],
        });
        
        if (count > 0) {
          console.log(`   - ${pathString}: ${count} NFTs`);
        }
      } catch (error) {
        // Path doesn't exist, skip
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SUMMARY:');
    
    if (Object.keys(paths).length === 0) {
      console.log('   ❌ No AllDay collections found with common paths');
      console.log('   💡 The collection might use a non-standard path');
    } else {
      const totalNFTs = Object.values(paths).reduce((sum, count) => sum + count, 0);
      console.log(`   Total NFTs found: ${totalNFTs}`);
      
      if (totalNFTs === 2614) {
        console.log(`   ✅ PERFECT! Found all ${totalNFTs} NFTs`);
      } else if (totalNFTs > 199) {
        console.log(`   🔍 Found ${totalNFTs} NFTs (more than the 199 from /public/AllDayNFTCollection)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findCorrectPath();

