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
