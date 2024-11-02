
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

# Execute the setup_sharded_collection script
Log-Message "Executing setup_sharded_collection script..."
flow transactions send .\sharding\transactions\setup_sharded_collection.cdc 50
Log-Message "setup_sharded_collection script executed."

# Execute the wrap_collection script
flow transactions send .\sharding\transactions\wrap_collection.cdc
Log-Message "setup_sharded_collection script executed."

flow transactions send .\sharding\transactions\unpublish_sharded_collection.cdc
Log-Message "unpublish_sharded_collection"
$summarySteps += "Collection IDs retrieved."

# Send the verify_collection transaction, expected to fail because the collection is not published
Log-Message "Sending verify_collection transaction..."
flow transactions send .\topshot\transactions\verify_collection.cdc
Log-Message "verify_collection transaction sent."

# Send setup_vault transaction for TSHOT
flow transactions send ./momentswap/transactions/setup_vault_tshot.cdc
Log-Message "setup_vault transaction sent."
$summarySteps += "TSHOT vault setup."

flow scripts execute ./momentswap/scripts/verify_vault_tshot.cdc 0xf8d6e0586b0a20c7
Log-Message "verify_vault script executed for 0xf8d6e0586b0a20c7."
$summarySteps += "TSHOT vaults verified."

# Send setup_vault transaction for TSHOT
flow transactions send ./momentswap/transactions/setup_vault_tshot.cdc --signer=justin
Log-Message "setup_vault transaction sent."
$summarySteps += "TSHOT vault setup."

# Execute verify_vault script for both accounts
Log-Message "Executing verify_vault script for 0x179b6b1cb6755e31..."
flow scripts execute ./momentswap/scripts/verify_vault_tshot.cdc 0x179b6b1cb6755e31
Log-Message "verify_vault script executed for 0x179b6b1cb6755e31."

# Send mint_TSHOT transaction
#1-3 ultimate
#4-18 base
#19-33 legendary
#34-48 rare
#49-63 fandom

Log-Message "Sending swap_nfts_for_tshot transaction with common"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [4] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its an ultimate
Log-Message "Sending swap_nfts_for_tshot transaction with ultimate"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [1] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its legendary
Log-Message "Sending swap_nfts_for_tshot transaction with legendary"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [19] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its rare
Log-Message "Sending swap_nfts_for_tshot transaction with rare"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [34] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its fandom
Log-Message "Sending swap_nfts_for_tshot transaction with fandom"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [49] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# User no longer has nft id 4 and now has a TSHOT balance of 1.0
Log-Message "Getting collection IDs and verifying balance for 0x179b6b1cb6755e31..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow scripts execute ./momentswap/scripts/verify_balance_tshot.cdc 0x179b6b1cb6755e31
Log-Message "Collection IDs and balance verified for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs and balances verified for both accounts."

# 
flow transactions send ./momentswap/transactions/commit_swap.cdc 1.0 --signer=justin

flow transactions send ./momentswap/transactions/reveal_swap.cdc --signer=justin

flow scripts execute ./sharding/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7

$summarySteps += "Final verifications completed."

# Script completion
Log-Message "Script completed. Summary:"

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
