# Initialize an array to store summary steps
$summarySteps = @()

# Function to log output with timestamps
function Log-Message {
    param(
        [string]$message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - $message"
    Write-Output $logEntry
    $logEntry | Add-Content -Path ".\deployment\logs\deployment.log"
}

# Log the start time
Log-Message "Script started."

# Send create_sets transactions
$sets = @("create_sets1.cdc", "create_sets2.cdc", "create_sets3.cdc", "create_sets4.cdc")
foreach ($set in $sets) {
    Log-Message "Sending transaction to create sets from $set..."
    flow transactions send "./topshot/transactions/$set" --signer=dapper
    Log-Message "$set transaction sent."
}
$summarySteps += "Sets created."

# Create plays
python .\topshot\tools\create_plays_test.py

# Send add_plays_to_sets transaction
Log-Message "Sending add_plays_to_sets transaction..."
flow transactions send ./topshot/transactions/add_plays_to_sets.cdc 1 [1,102,109] --signer=dapper
Log-Message "add_plays_to_sets transaction sent."
$summarySteps += "Plays added to sets."

# Send add_plays_to_sets transaction
Log-Message "Sending add_plays_to_sets transaction..."
flow transactions send ./topshot/transactions/add_plays_to_sets.cdc 2 [1,102,109] --signer=dapper
Log-Message "add_plays_to_sets transaction sent."
$summarySteps += "Plays added to sets."

# Send add_plays_to_sets transaction
Log-Message "Sending add_plays_to_sets transaction..."
flow transactions send ./topshot/transactions/add_plays_to_sets.cdc 4 [1,102,109] --signer=dapper
Log-Message "add_plays_to_sets transaction sent."
$summarySteps += "Plays added to sets."

# Send add_plays_to_sets transaction
Log-Message "Sending add_plays_to_sets transaction..."
flow transactions send ./topshot/transactions/add_plays_to_sets.cdc 5 [1,102,109] --signer=dapper
Log-Message "add_plays_to_sets transaction sent."
$summarySteps += "Plays added to sets."

# Send add_plays_to_sets transaction
Log-Message "Sending add_plays_to_sets transaction..."
flow transactions send ./topshot/transactions/add_plays_to_sets.cdc 43 [1478,1479,1480] --signer=dapper
Log-Message "add_plays_to_sets transaction sent."
$summarySteps += "Plays added to sets."

# Send mint_moments transaction setID: UInt32, playID: UInt32, quantity: UInt64, recipientAddr: Address
#1-3 ultimate
#4-18 base
#19-33 legendary
#34-48 rare
#49-63 fandom

Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 1 1 1 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction setID: UInt32, playID: UInt32, quantity: UInt64, recipientAddr: Address
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 1 102 1 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction setID: UInt32, playID: UInt32, quantity: UInt64, recipientAddr: Address
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 1 109 1 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 2 1 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 2 102 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 2 109 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 4 1 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 4 102 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 4 109 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 5 1 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction 
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 5 102 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 5 109 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 43 1478 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 43 1479 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 43 1480 5 0xf3fcd2c1a78f5eee --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf3fcd2c1a78f5eee
Log-Message "get_collection_ids script executed for 0xf8d6e0586b0a20c7."

flow transactions send .\topshot\transactions\setup_collection.cdc --signer=justin
Log-Message "setup_collection script executed for justin."

# Send batch_transfer transaction
flow transactions send ./topshot/transactions/batch_transfer.cdc 0x179b6b1cb6755e31 [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63] --signer=dapper
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
Log-Message "get_collection_ids script executed for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs retrieved."

flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf3fcd2c1a78f5eee
Log-Message "get_collection_ids script executed for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs retrieved."

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
