// Test script to check AllDay NFT count
import * as fcl from '@onflow/fcl';
import { getAllDayCollectionCount } from './src/flow/getAllDayCollectionCount';

async function checkAllDayCount() {
  const address = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`Checking AllDay NFT count for address: ${address}`);
    
    const count = await fcl.query({
      cadence: getAllDayCollectionCount,
      args: (arg, t) => [arg(address, t.Address)],
    });
    
    console.log(`Total AllDay NFTs found: ${count}`);
    
    // Also check what our current script returns
    const { getAllDayCollectionIDs } = await import('./src/flow/getAllDayCollectionIDs');
    
    const ids = await fcl.query({
      cadence: getAllDayCollectionIDs,
      args: (arg, t) => [arg(address, t.Address)],
    });
    
    console.log(`Current script returns: ${ids.length} NFTs`);
    console.log(`Difference: ${count - ids.length} NFTs missing`);
    
    if (ids.length < count) {
      console.log("❌ ISSUE CONFIRMED: Our script is missing NFTs!");
      console.log(`Missing ${count - ids.length} NFTs out of ${count} total`);
    } else {
      console.log("✅ Script working correctly");
    }
    
  } catch (error) {
    console.error('Error checking AllDay count:', error);
  }
}

// Run the check
checkAllDayCount();

