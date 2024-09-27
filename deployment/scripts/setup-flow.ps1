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

# Deploy the project
Log-Message "Deploying the project..."
flow project deploy
Log-Message "Project deployed."
$summarySteps += "Project deployed."

# Generate keys and store the output in a variable
Log-Message "Generating keys..."
$keysOutput = flow keys generate
Log-Message "Keys generation output captured."

# Extract the Private Key and save it to justin.pkey
$matches = [regex]::Matches($keysOutput, "Private Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $privateKey = $matches[0].Groups[1].Value
    Log-Message "Extracted Private Key: $privateKey"
    Set-Content -Path "justin.pkey" -Value $privateKey -NoNewline -Encoding Ascii
    Log-Message "Private Key saved to justin.pkey"
}

# Extract the Public Key and use it for the next command
$matches = [regex]::Matches($keysOutput, "Public Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $publicKey = $matches[0].Groups[1].Value
    Log-Message "Extracted Public Key: $publicKey"
    flow accounts create --key $publicKey
    Log-Message "Account created with Public Key: $publicKey"
    $summarySteps += "Account created with collections setup and verified."
}

# Send the setup_collection transaction
Log-Message "Sending setup_collection transaction..."
flow transactions send .\topshot\transactions\setup_collection.cdc --signer=justin
Log-Message "setup_collection transaction sent."

# Send the verify_collection transaction
Log-Message "Sending verify_collection transaction..."
flow transactions send .\topshot\transactions\verify_collection.cdc --signer=justin
Log-Message "verify_collection transaction sent."

# Execute the verify_collection script
Log-Message "Executing verify_collection script..."
flow scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
Log-Message "verify_collection script executed."

# Add Flow Balance to new accounts
Log-Message "Executing fund_emulator transaction for 0xf8d6e0586b0a20c7..."
flow transactions send .\utilities\fund_emulator.cdc 0xf8d6e0586b0a20c7 1000.0
Log-Message "fund_emulator transaction executed for 0xf8d6e0586b0a20c7."
$summarySteps += "Accounts funded."

Log-Message "Executing get_balance script..."
flow scripts execute .\utilities\get_balance.cdc 0xf8d6e0586b0a20c7
Log-Message "get_balance script executed."

Log-Message "Executing fund_emulator transaction for 0x179b6b1cb6755e31..."
flow transactions send .\utilities\fund_emulator.cdc 0x179b6b1cb6755e31 1000.0
Log-Message "fund_emulator transaction executed for 0x179b6b1cb6755e31."

Log-Message "Executing get_balance script for 0x179b6b1cb6755e31..."
flow scripts execute .\utilities\get_balance.cdc 0x179b6b1cb6755e31
Log-Message "get_balance script executed for 0x179b6b1cb6755e31."

# Send create_sets transactions
$sets = @("create_sets1.cdc", "create_sets2.cdc", "create_sets3.cdc", "create_sets4.cdc")
foreach ($set in $sets) {
    Log-Message "Sending transaction to create sets from $set..."
    flow transactions send "./topshot/transactions/$set"
    Log-Message "$set transaction sent."
}
$summarySteps += "Sets created."

# Additional verification steps
Log-Message "Executing verify_collection script again for final verification..."
flow scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
Log-Message "verify_collection script executed again."

Log-Message "Sending verify_entitlements transaction..."
flow transactions send .\topshot\transactions\verify_entitlements.cdc 0x179b6b1cb6755e31
Log-Message "verify_entitlements transaction sent."
$summarySteps += "Final verifications completed."

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

# Script completion
Log-Message "Script completed. Summary:"

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
