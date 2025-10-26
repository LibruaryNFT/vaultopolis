// Check child accounts for AllDay NFTs
const fcl = require('@onflow/fcl');

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

const getChildren = `
import ChildAccount from 0x1d7e57aa55817448

access(all) fun main(parentAddress: Address): [Address] {
    let account = getAccount(parentAddress)
    let childrenCap = account.capabilities.borrow<&{ChildAccount.GetChildren}>(/public/ChildAccountChildren)
    if childrenCap == nil {
        return []
    }
    return childrenCap.getChildren()
}
`;

const getAllDayCollectionCountOfficial = `
import NonFungibleToken from 0x1d7e57aa55817448
import AllDay from 0xe4cf4bdc1751c65d

access(all) fun main(address: Address): Int {
    let account = getAccount(address)
    let collectionRef = getAccount(address).capabilities.borrow<&AllDay.Collection>(AllDay.CollectionPublicPath)
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs().length
}
`;

async function checkChildAccounts() {
  const parentAddress = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Checking AllDay NFTs in child accounts for: ${parentAddress}`);
    console.log('='.repeat(70));
    
    // 1. Check parent account
    console.log('1. Checking parent account...');
    const parentCount = await fcl.query({
      cadence: getAllDayCollectionCountOfficial,
      args: (arg, t) => [arg(parentAddress, t.Address)],
    });
    console.log(`   Parent (${parentAddress}): ${parentCount} NFTs`);
    
    // 2. Get child accounts
    console.log('\n2. Getting child accounts...');
    const children = await fcl.query({
      cadence: getChildren,
      args: (arg, t) => [arg(parentAddress, t.Address)],
    });
    console.log(`   Found ${children.length} child accounts`);
    
    // 3. Check each child account
    let totalCount = parentCount;
    console.log('\n3. Checking child accounts...');
    
    for (let i = 0; i < children.length; i++) {
      const childAddress = children[i];
      try {
        const childCount = await fcl.query({
          cadence: getAllDayCollectionCountOfficial,
          args: (arg, t) => [arg(childAddress, t.Address)],
        });
        console.log(`   Child ${i + 1} (${childAddress}): ${childCount} NFTs`);
        totalCount += childCount;
      } catch (error) {
        console.log(`   Child ${i + 1} (${childAddress}): Error - ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 SUMMARY:');
    console.log(`   Parent account: ${parentCount} NFTs`);
    console.log(`   Child accounts: ${totalCount - parentCount} NFTs`);
    console.log(`   TOTAL: ${totalCount} NFTs`);
    
    if (totalCount === 2614) {
      console.log(`   ✅ PERFECT MATCH! Found all ${totalCount} NFTs`);
      console.log(`   🎉 The missing NFTs were in child accounts!`);
    } else if (totalCount > 199) {
      console.log(`   🔍 Found ${totalCount} NFTs (more than the 199 in parent account)`);
      console.log(`   Still missing: ${2614 - totalCount} NFTs`);
    } else {
      console.log(`   ❌ Still only ${totalCount} NFTs, expected 2614`);
      console.log(`   Missing: ${2614 - totalCount} NFTs`);
    }
    
    // 4. Additional analysis
    console.log('\n💡 ANALYSIS:');
    if (totalCount < 2614) {
      console.log('   The official AllDay site might be:');
      console.log('   1. Using a different data source (API, not blockchain)');
      console.log('   2. Counting NFTs from multiple accounts');
      console.log('   3. Including NFTs from a different collection');
      console.log('   4. Using cached/stale data');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkChildAccounts();

