// Comprehensive test to debug AllDay NFT count issue
import * as fcl from '@onflow/fcl';
import { getAllDayCollectionCount } from './src/flow/getAllDayCollectionCount';
import { getAllDayCollectionIDs } from './src/flow/getAllDayCollectionIDs';
import { getAllDayCollectionIDsBatched } from './src/flow/getAllDayCollectionIDsBatched';

async function debugAllDayCount() {
  const address = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Debugging AllDay NFT count for address: ${address}`);
    console.log('='.repeat(60));
    
    // 1. Get total count
    console.log('1. Getting total count...');
    const totalCount = await fcl.query({
      cadence: getAllDayCollectionCount,
      args: (arg, t) => [arg(address, t.Address)],
    });
    console.log(`   Total AllDay NFTs: ${totalCount}`);
    
    // 2. Get all IDs at once
    console.log('\n2. Getting all IDs at once...');
    const allIds = await fcl.query({
      cadence: getAllDayCollectionIDs,
      args: (arg, t) => [arg(address, t.Address)],
    });
    console.log(`   IDs returned: ${allIds.length}`);
    
    if (allIds.length !== totalCount) {
      console.log(`   ❌ MISMATCH: Expected ${totalCount}, got ${allIds.length}`);
      console.log(`   Missing: ${totalCount - allIds.length} NFTs`);
    } else {
      console.log(`   ✅ Match: All ${totalCount} NFTs returned`);
    }
    
    // 3. Test batched approach
    console.log('\n3. Testing batched approach...');
    const batchSize = 100;
    let allBatchedIds = [];
    let batchCount = 0;
    
    for (let startIndex = 0; startIndex < totalCount; startIndex += batchSize) {
      const batch = await fcl.query({
        cadence: getAllDayCollectionIDsBatched,
        args: (arg, t) => [
          arg(address, t.Address),
          arg(startIndex, t.UInt64),
          arg(batchSize, t.UInt64)
        ],
      });
      
      allBatchedIds = allBatchedIds.concat(batch);
      batchCount++;
      
      console.log(`   Batch ${batchCount}: ${batch.length} IDs (start: ${startIndex})`);
      
      // Safety check to avoid infinite loops
      if (batch.length === 0) break;
    }
    
    console.log(`   Total batched IDs: ${allBatchedIds.length}`);
    
    if (allBatchedIds.length === totalCount) {
      console.log(`   ✅ Batched approach works: All ${totalCount} NFTs retrieved`);
    } else {
      console.log(`   ❌ Batched approach also has issues`);
    }
    
    // 4. Check for duplicates or missing IDs
    console.log('\n4. Analyzing ID patterns...');
    const uniqueIds = [...new Set(allIds)];
    console.log(`   Unique IDs in single query: ${uniqueIds.length}`);
    
    if (allIds.length !== uniqueIds.length) {
      console.log(`   ⚠️  Duplicates found: ${allIds.length - uniqueIds.length}`);
    }
    
    // 5. Check ID ranges
    if (allIds.length > 0) {
      const sortedIds = allIds.sort((a, b) => a - b);
      console.log(`   ID range: ${sortedIds[0]} to ${sortedIds[sortedIds.length - 1]}`);
      console.log(`   First 10 IDs: ${sortedIds.slice(0, 10).join(', ')}`);
      console.log(`   Last 10 IDs: ${sortedIds.slice(-10).join(', ')}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SUMMARY:');
    console.log(`   Expected: ${totalCount} NFTs`);
    console.log(`   Single query: ${allIds.length} NFTs`);
    console.log(`   Batched query: ${allBatchedIds.length} NFTs`);
    
    if (allIds.length < totalCount) {
      console.log(`   🔧 RECOMMENDATION: Use batched approach for large collections`);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugAllDayCount();

