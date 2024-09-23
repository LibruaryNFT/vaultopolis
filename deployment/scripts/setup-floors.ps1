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
flow transactions send ./topshot/transactions/create_custom_plays.cdc
Log-Message "create_custom_plays transaction sent."
$summarySteps += "Custom plays created."

# Send add_plays_to_sets transaction
Log-Message "Sending add_plays_to_sets transaction..."
flow transactions send ./topshot/transactions/add_plays_to_sets.cdc 1 [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]
Log-Message "add_plays_to_sets transaction sent."
$summarySteps += "Plays added to sets."

# Send mint_moments transaction
Log-Message "Sending mint_moments transaction..."
flow transactions send ./topshot/transactions/mint_moments.cdc 1 2 20 0x179b6b1cb6755e31
Log-Message "mint_moments transaction sent."
$summarySteps += "Moments minted."

# Execute get_collection_ids script for both accounts
Log-Message "Executing get_collection_ids script for 0xf8d6e0586b0a20c7..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7
Log-Message "get_collection_ids script executed for 0xf8d6e0586b0a20c7."

Log-Message "Executing get_collection_ids script for 0x179b6b1cb6755e31..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
Log-Message "get_collection_ids script executed for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs retrieved."

Log-Message "Executing exchangeNFT script for 0x179b6b1cb6755e31..."
flow transactions send .\topshotfloors\transactions\exchange_NFTs.cdc [1] --signer=justin
Log-Message "exchangeNFT script executed for 0x179b6b1cb6755e31."
$summarySteps += "exchangeNFT successful."

# Execute get_collection_ids script for both accounts
Log-Message "Executing get_collection_ids script for 0xf8d6e0586b0a20c7..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7
Log-Message "get_collection_ids script executed for 0xf8d6e0586b0a20c7."

Log-Message "Executing get_collection_ids script for 0x179b6b1cb6755e31..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
Log-Message "get_collection_ids script executed for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs retrieved."

Log-Message "Executing get_balance script for 0x179b6b1cb6755e31..."
flow scripts execute .\utilities\get_balance.cdc 0x179b6b1cb6755e31
Log-Message "get_balance script executed for 0x179b6b1cb6755e31."
$summarySteps += "get_balance retrieved."

Log-Message "Executing get_balance script for 0xf8d6e0586b0a20c7..."
flow scripts execute .\utilities\get_balance.cdc 0xf8d6e0586b0a20c7
Log-Message "get_balance script executed for 0xf8d6e0586b0a20c7."
$summarySteps += "get_balance retrieved."

Log-Message "Executing get_price script..."
flow scripts execute ./topshotfloors/scripts/get_price.cdc
Log-Message "get_price script executed."
$summarySteps += "get_price retrieved."

Log-Message "Executing update_price script..."
flow transactions send ./topshotfloors/transactions/update_price.cdc 1.5
Log-Message "update_price script executed."
$summarySteps += "update_price retrieved."

Log-Message "Executing get_price script..."
flow scripts execute ./topshotfloors/scripts/get_price.cdc
Log-Message "get_price script executed."
$summarySteps += "get_price retrieved."
