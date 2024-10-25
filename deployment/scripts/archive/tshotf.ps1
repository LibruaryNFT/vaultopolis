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

# Send setup_vault transaction for TSHOT
Log-Message "Sending setup_vault transaction for TSHOT..."
flow transactions send ./topshotexchange/transactions/setup_vault_tshotf.cdc
Log-Message "setup_vault transaction sent."
$summarySteps += "TSHOT vault setup."

Log-Message "Executing verify_vault script for 0xf8d6e0586b0a20c7..."
flow scripts execute ./topshotexchange/scripts/verify_vault_tshotf.cdc 0xf8d6e0586b0a20c7
Log-Message "verify_vault script executed for 0xf8d6e0586b0a20c7."
$summarySteps += "TSHOT vaults verified."

# Send setup_vault transaction for TSHOT
Log-Message "Sending setup_vault transaction for TSHOT..."
flow transactions send ./topshotexchange/transactions/setup_vault_tshotf.cdc --signer=justin
Log-Message "setup_vault transaction sent."
$summarySteps += "TSHOT vault setup."

# Execute verify_vault script for both accounts
Log-Message "Executing verify_vault script for 0x179b6b1cb6755e31..."
flow scripts execute ./topshotexchange/scripts/verify_vault_tshotf.cdc 0x179b6b1cb6755e31
Log-Message "verify_vault script executed for 0x179b6b1cb6755e31."

# Send mint_TSHOT transaction
#1-3 ultimate
#4-18 base
#19-33 legendary
#34-48 rare
#49-63 fandom

Log-Message "Sending mint_TSHOT transaction..."
flow transactions send ./topshotexchange/transactions/swap_nfts_for_tshotf.cdc [49] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its an ultimate
Log-Message "Sending mint_TSHOT transaction..."
flow transactions send ./topshotexchange/transactions/swap_nfts_for_tshotf.cdc [1] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its legendary
Log-Message "Sending mint_TSHOT transaction..."
flow transactions send ./topshotexchange/transactions/swap_nfts_for_tshotf.cdc [19] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its common
Log-Message "Sending mint_TSHOT transaction..."
flow transactions send ./topshotexchange/transactions/swap_nfts_for_tshotf.cdc [4] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Execute get_collection_ids and verify_balance scripts for both accounts
Log-Message "Executing get_collection_ids and verify_balance scripts..."

Log-Message "Getting collection IDs and verifying balance for 0xf8d6e0586b0a20c7..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7
flow scripts execute ./topshotexchange/scripts/verify_balance_tshotf.cdc 0xf8d6e0586b0a20c7
Log-Message "Collection IDs and balance verified for 0xf8d6e0586b0a20c7."

Log-Message "Getting collection IDs and verifying balance for 0x179b6b1cb6755e31..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow scripts execute ./topshotexchange/scripts/verify_balance_tshotf.cdc 0x179b6b1cb6755e31
Log-Message "Collection IDs and balance verified for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs and balances verified for both accounts."

# Send exchange_TSHOT transaction
Log-Message "Sending exchange_TSHOT transaction..."
flow transactions send ./topshotexchange/transactions/swap_tshotf_for_nfts.cdc 1.0 --signer=justin
Log-Message "exchange_TSHOT transaction sent."
$summarySteps += "TSHOT exchanged."

# Final verifications
Log-Message "Executing final verifications..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow scripts execute ./topshotexchange/scripts/verify_balance_tshotf.cdc 0x179b6b1cb6755e31
Log-Message "Final verifications completed for 0x179b6b1cb6755e31."

$summarySteps += "Final verifications completed."

# Script completion
Log-Message "Script completed. Summary:"

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
