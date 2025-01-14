
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

Log-Message "Getting price of floor..."
flow scripts execute ./topshotfloors/scripts/get_price.cdc 

flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31

flow scripts execute .\utilities\get_balance.cdc 0x179b6b1cb6755e31

flow transactions send ./topshotfloors/transactions/exchange_NFTs.cdc [175,278] --signer=justin

flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31

flow scripts execute .\utilities\get_balance.cdc 0x179b6b1cb6755e31






flow scripts execute ./sharding/scripts/verify_collection_details.cdc
# 
flow transactions send ./momentswap/transactions/commit_swap.cdc 1.0 --signer=justin

flow scripts execute ./momentswap/scripts/verify_receipt.cdc 0x179b6b1cb6755e31

flow transactions send ./momentswap/transactions/reveal_swap.cdc 0x179b6b1cb6755e31 --signer=justin

flow scripts execute ./sharding/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7

$summarySteps += "Final verifications completed."

# Script completion
Log-Message "Script completed. Summary:"

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
