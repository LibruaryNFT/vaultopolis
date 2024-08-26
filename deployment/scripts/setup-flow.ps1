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
flow-c1 project deploy
Log-Message "Project deployed."
$summarySteps += "Project deployed."

# Generate keys and store the output in a variable
Log-Message "Generating keys..."
$keysOutput = flow-c1 keys generate
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
    flow-c1 accounts create --key $publicKey
    Log-Message "Account created with Public Key: $publicKey"
    $summarySteps += "Account created with collections setup and verified."
}

# Send the setup_collection transaction
Log-Message "Sending setup_collection transaction..."
flow-c1 transactions send .\topshot\transactions\setup_collection.cdc --signer=justin
Log-Message "setup_collection transaction sent."

# Send the verify_collection transaction
Log-Message "Sending verify_collection transaction..."
flow-c1 transactions send .\topshot\transactions\verify_collection.cdc --signer=justin
Log-Message "verify_collection transaction sent."

# Execute the verify_collection script
Log-Message "Executing verify_collection script..."
flow-c1 scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
Log-Message "verify_collection script executed."

# Add Flow Balance to new accounts
Log-Message "Executing fund_emulator transaction for 0xf8d6e0586b0a20c7..."
flow-c1 transactions send .\utilities\fund_emulator.cdc 0xf8d6e0586b0a20c7 1000.0
Log-Message "fund_emulator transaction executed for 0xf8d6e0586b0a20c7."
$summarySteps += "Accounts funded."

Log-Message "Executing get_balance script..."
flow-c1 scripts execute .\utilities\get_balance.cdc 0xf8d6e0586b0a20c7
Log-Message "get_balance script executed."

Log-Message "Executing fund_emulator transaction for 0x179b6b1cb6755e31..."
flow-c1 transactions send .\utilities\fund_emulator.cdc 0x179b6b1cb6755e31 1000.0
Log-Message "fund_emulator transaction executed for 0x179b6b1cb6755e31."

Log-Message "Executing get_balance script for 0x179b6b1cb6755e31..."
flow-c1 scripts execute .\utilities\get_balance.cdc 0x179b6b1cb6755e31
Log-Message "get_balance script executed for 0x179b6b1cb6755e31."

# Send create_sets transactions
$sets = @("create_sets1.cdc", "create_sets2.cdc", "create_sets3.cdc", "create_sets4.cdc")
foreach ($set in $sets) {
    Log-Message "Sending transaction to create sets from $set..."
    flow-c1 transactions send "./topshot/transactions/$set"
    Log-Message "$set transaction sent."
}
$summarySteps += "Sets created."

# Additional verification steps
Log-Message "Executing verify_collection script again for final verification..."
flow-c1 scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
Log-Message "verify_collection script executed again."

Log-Message "Sending verify_entitlements transaction..."
flow-c1 transactions send .\topshot\transactions\verify_entitlements.cdc 0x179b6b1cb6755e31
Log-Message "verify_entitlements transaction sent."
$summarySteps += "Final verifications completed."

# Script completion
Log-Message "Script completed. Summary:"

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
