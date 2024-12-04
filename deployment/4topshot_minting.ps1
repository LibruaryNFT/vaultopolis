# Initialize an array to store summary steps
$summarySteps = @()

# Function to log output with timestamps
function Log-Message {
    param(
        [string]$message,
        [string]$status = "INFO",  # Default status is INFO
        [string]$response = ""    # Optional response
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - [$status] - $message"

    # Include response if provided
    if ($response -ne "") {
        $logEntry += "`n$response"
    }

    Write-Output $logEntry
    $logEntry | Add-Content -Path ".\deployment\logs\deployment.log"
}

# Log the start time
Log-Message "Script execution started."

# Send minting transactions
Log-Message "Sending mint_moments transaction..."
try {
    flow transactions send ./topshot/transactions/mint_moments.cdc 2 32 300 0x179b6b1cb6755e31 --signer=dapper
    Log-Message "mint_moments transaction sent for Common moments." "SUCCESS"
    $summarySteps += "Common moments minted."
} catch {
    Log-Message "mint_moments transaction failed for Common moments." "ERROR" $_.Exception.Message
}

try {
    flow transactions send ./topshot/transactions/mint_moments.cdc 38 1068 1 0x179b6b1cb6755e31 --signer=dapper
    Log-Message "mint_moments transaction sent for Rare moments." "SUCCESS"
    $summarySteps += "Rare moments minted."
} catch {
    Log-Message "mint_moments transaction failed for Rare moments." "ERROR" $_.Exception.Message
}

try {
    flow transactions send ./topshot/transactions/mint_moments.cdc 50 1664 1 0x179b6b1cb6755e31 --signer=dapper
    Log-Message "mint_moments transaction sent for Legendary moments." "SUCCESS"
    $summarySteps += "Legendary moments minted."
} catch {
    Log-Message "mint_moments transaction failed for Legendary moments." "ERROR" $_.Exception.Message
}

try {
    flow transactions send ./topshot/transactions/mint_moments.cdc 59 2083 1 0x179b6b1cb6755e31 --signer=dapper
    Log-Message "mint_moments transaction sent for Common moments." "SUCCESS"
    $summarySteps += "Common moments minted."
} catch {
    Log-Message "mint_moments transaction failed for Common moments." "ERROR" $_.Exception.Message
}

try {
    flow transactions send ./topshot/transactions/mint_moments.cdc 74 2648 1 0x179b6b1cb6755e31 --signer=dapper
    Log-Message "mint_moments transaction sent for Legendary moments." "SUCCESS"
    $summarySteps += "Legendary moments minted."
} catch {
    Log-Message "mint_moments transaction failed for Legendary moments." "ERROR" $_.Exception.Message
}

try {
    flow transactions send ./topshot/transactions/mint_moments.cdc 125 4335 1 0x179b6b1cb6755e31 --signer=dapper
    Log-Message "mint_moments transaction sent for Common moments." "SUCCESS"
    $summarySteps += "Common moments minted."
} catch {
    Log-Message "mint_moments transaction failed for Common moments." "ERROR" $_.Exception.Message
}

try {
    flow transactions send ./topshot/transactions/mint_moments.cdc 165 5737 1 0x179b6b1cb6755e31 --signer=dapper
    Log-Message "mint_moments transaction sent." "SUCCESS"
    $summarySteps += "Moments minted."
} catch {
    Log-Message "mint_moments transaction failed." "ERROR" $_.Exception.Message
}

# Execute the collection verification script
Log-Message "Executing get_collection_ids script..."
try {
    $response = flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
    if ($response -match "Result") {
        Log-Message "get_collection_ids script executed successfully." "SUCCESS" $response
        $summarySteps += "Collection IDs retrieved."
    } else {
        throw "Script did not return a valid response."
    }
} catch {
    Log-Message "get_collection_ids script execution failed." "ERROR" $_.Exception.Message
}

# Print out the summary
Log-Message "Summary of steps completed:"
$summarySteps | ForEach-Object { Log-Message $_ }

# Log the completion of the script
Log-Message "Script execution completed."
