// Check AllDay NFTs in child accounts
const fcl = require('@onflow/fcl');

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "Vaultopolis",
  "app.detail.icon": "https://vaultopolis.com/logo192.png"
});

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

const getChildren = `
access(all) fun main(parentAddress: Address): [Address] {
    let account = getAccount(parentAddress)
    let childrenCap = account.capabilities.borrow<&{ChildAccount.GetChildren}>(/public/ChildAccountChildren)
    if childrenCap == nil {
        return []
    }
    return childrenCap.getChildren()
}
`;

async function checkAllAccounts() {
  const parentAddress = "0x58bdc3d07e83ba18";
  
  try {
    console.log(`🔍 Checking AllDay NFTs across all accounts for: ${parentAddress}`);
    console.log('='.repeat(60));
    
    // 1. Check parent account
    console.log('1. Checking parent account...');
    const parentCount = await fcl.query({
      cadence: getAllDayCollectionCount,
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
          cadence: getAllDayCollectionCount,
          args: (arg, t) => [arg(childAddress, t.Address)],
        });
        console.log(`   Child ${i + 1} (${childAddress}): ${childCount} NFTs`);
        totalCount += childCount;
      } catch (error) {
        console.log(`   Child ${i + 1} (${childAddress}): Error - ${error.message.split('\n')[0]}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 SUMMARY:');
    console.log(`   Parent account: ${parentCount} NFTs`);
    console.log(`   Child accounts: ${totalCount - parentCount} NFTs`);
    console.log(`   TOTAL: ${totalCount} NFTs`);
    
    if (totalCount === 2614) {
      console.log(`   ✅ PERFECT MATCH! Found all ${totalCount} NFTs`);
    } else if (totalCount > 199) {
      console.log(`   🔍 Found ${totalCount} NFTs (more than the 199 in parent account)`);
      console.log(`   Still missing: ${2614 - totalCount} NFTs`);
    } else {
      console.log(`   ❌ Still only ${totalCount} NFTs, expected 2614`);
      console.log(`   Missing: ${2614 - totalCount} NFTs`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllAccounts();

