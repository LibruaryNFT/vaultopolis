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

# Send create_custom_plays transaction
Log-Message "Sending create_custom_plays transaction..."
flow-c1 transactions send ./topshot/transactions/create_custom_plays.cdc
Log-Message "create_custom_plays transaction sent."
$summarySteps += "Custom plays created."

# Send add_plays_to_sets transaction
Log-Message "Sending add_plays_to_sets transaction..."
flow-c1 transactions send ./topshot/transactions/add_plays_to_sets.cdc 1 [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
Log-Message "add_plays_to_sets transaction sent."
$summarySteps += "Plays added to sets."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow-c1 transactions send ./topshot/transactions/mint_moments.cdc 1 2 20 0x179b6b1cb6755e31
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Execute get_collection_ids script for both accounts
Log-Message "Executing get_collection_ids script for 0xf8d6e0586b0a20c7..."
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7
Log-Message "get_collection_ids script executed for 0xf8d6e0586b0a20c7."

Log-Message "Executing get_collection_ids script for 0x179b6b1cb6755e31..."
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
Log-Message "get_collection_ids script executed for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs retrieved."

# Send setup_vault transaction for TSHOT
Log-Message "Sending setup_vault transaction for TSHOT..."
flow-c1 transactions send ./tshot/transactions/setup_vault.cdc --signer=justin
Log-Message "setup_vault transaction sent."
$summarySteps += "TSHOT vault setup."

# Execute verify_vault script for both accounts
Log-Message "Executing verify_vault script for 0x179b6b1cb6755e31..."
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0x179b6b1cb6755e31
Log-Message "verify_vault script executed for 0x179b6b1cb6755e31."

Log-Message "Executing verify_vault script for 0xf8d6e0586b0a20c7..."
flow-c1 scripts execute ./tshot/scripts/verify_vault.cdc 0xf8d6e0586b0a20c7
Log-Message "verify_vault script executed for 0xf8d6e0586b0a20c7."
$summarySteps += "TSHOT vaults verified."

# Send mint_TSHOT transaction
Log-Message "Sending mint_TSHOT transaction..."
flow-c1 transactions send ./tshot/transactions/mint_TSHOT.cdc [1] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Execute get_collection_ids and verify_balance scripts for both accounts
Log-Message "Executing get_collection_ids and verify_balance scripts..."

Log-Message "Getting collection IDs and verifying balance for 0xf8d6e0586b0a20c7..."
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0xf8d6e0586b0a20c7
Log-Message "Collection IDs and balance verified for 0xf8d6e0586b0a20c7."

Log-Message "Getting collection IDs and verifying balance for 0x179b6b1cb6755e31..."
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0x179b6b1cb6755e31
Log-Message "Collection IDs and balance verified for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs and balances verified for both accounts."

flow-c1 scripts execute ./tshot/scripts/get_vault_nfts.cdc 0xf8d6e0586b0a20c7
flow-c1 scripts execute ./tshot/scripts/get_vault_metadata.cdc 1

flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0xf8d6e0586b0a20c7

# Send exchange_TSHOT transaction
Log-Message "Sending exchange_TSHOT transaction..."
flow-c1 transactions send ./tshot/transactions/exchange_TSHOT.cdc 1.0 --signer=justin
Log-Message "exchange_TSHOT transaction sent."
$summarySteps += "TSHOT exchanged."

# Send mint_TSHOT transaction
Log-Message "Sending mint_TSHOT transaction..."
flow-c1 transactions send ./tshot/transactions/mint_TSHOT.cdc [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send exchange_TSHOT transaction
Log-Message "Sending exchange_TSHOT transaction..."
flow-c1 transactions send ./tshot/transactions/exchange_TSHOT.cdc 10.0 --signer=justin
Log-Message "exchange_TSHOT transaction sent."
$summarySteps += "TSHOT exchanged."

# Final verifications
Log-Message "Executing final verifications..."
flow-c1 scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow-c1 scripts execute ./tshot/scripts/verify_balance.cdc 0x179b6b1cb6755e31
Log-Message "Final verifications completed for 0x179b6b1cb6755e31."

$summarySteps += "Final verifications completed."

# Script completion
Log-Message "Script completed. Summary:"

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
