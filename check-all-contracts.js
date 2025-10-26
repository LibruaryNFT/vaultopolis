// Check for other AllDay contract addresses
const fcl = require('@onflow/fcl');

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

// Common AllDay contract addresses to check
const allDayContracts = [
  "0xe4cf4bdc1751c65d", // Current one we're using
  "0x1d7e57aa55817448", // NonFungibleToken address (might have AllDay too)
  "0xf233dcee88fe0abe", // FungibleToken address
  // Add more potential addresses
];

const checkContractForAllDay = `
import NonFungibleToken from 0x1d7e57aa55817448

access(all) fun main(contractAddress: Address, userAddress: Address): UInt64 {
    let account = getAccount(userAddress)
    
    // Try to borrow AllDay collection from the specified contract
    if let collectionRef = account.capabilities.borrow<&{NonFungibleToken.CollectionPublic}>(/public/AllDayNFTCollection) {
        return UInt64(collectionRef.getIDs().length)
    }
    
    return 0
}
`;

async function checkAllDayContracts() {
  const userAddress = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Checking AllDay contracts for user: ${userAddress}`);
    console.log('='.repeat(70));
    
    const results = [];
    
    for (const contractAddress of allDayContracts) {
      try {
        console.log(`Checking contract: ${contractAddress}...`);
        
        const count = await fcl.query({
          cadence: checkContractForAllDay,
          args: (arg, t) => [
            arg(contractAddress, t.Address),
            arg(userAddress, t.Address)
          ],
        });
        
        if (count > 0) {
          results.push({ contract: contractAddress, count });
          console.log(`  ✅ Found ${count} NFTs`);
        } else {
          console.log(`  ❌ No NFTs found`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 SUMMARY:');
    
    if (results.length === 0) {
      console.log('   ❌ No AllDay NFTs found with any contract');
    } else {
      console.log('   Found AllDay NFTs with:');
      results.forEach(result => {
        console.log(`   - Contract ${result.contract}: ${result.count} NFTs`);
      });
      
      const totalNFTs = results.reduce((sum, result) => sum + result.count, 0);
      console.log(`   Total NFTs: ${totalNFTs}`);
      
      if (totalNFTs === 2614) {
        console.log(`   ✅ PERFECT! Found all ${totalNFTs} NFTs`);
      } else if (totalNFTs > 199) {
        console.log(`   🔍 Found ${totalNFTs} NFTs (more than the 199 from single contract)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllDayContracts();

