# Function to log output with timestamps and success/failure status
function Log-Message {
    param(
        [string]$message,
        [string]$status = "INFO"  # Default to "INFO" for general messages
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - [$status] - $message"
    Write-Output $logEntry
    $logEntry | Add-Content -Path ".\deployment\logs\deployment.log"
}

# Log the start time
Log-Message "Script started."

# Step 1: Generate keys
Log-Message "Generating keys..."
$keysOutput = flow keys generate
if ($keysOutput) {
    Log-Message "Keys generation output captured." "SUCCESS"
} else {
    Log-Message "Failed to generate keys." "ERROR"
}

# Step 2: Extract the Private Key and save it to justin.pkey (in the root of the project)
Log-Message "Extracting and saving Private Key for justin.pkey..."
$matches = [regex]::Matches($keysOutput, "Private Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $privateKey = $matches[0].Groups[1].Value
    Set-Content -Path ".\justin.pkey" -Value $privateKey -NoNewline -Encoding Ascii
    Log-Message "Private Key saved to justin.pkey." "SUCCESS"
} else {
    Log-Message "Failed to extract Private Key for justin.pkey." "ERROR"
}

# Step 3: Extract the Public Key and create an account
Log-Message "Extracting Public Key and creating account..."
$matches = [regex]::Matches($keysOutput, "Public Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $publicKey = $matches[0].Groups[1].Value
    flow accounts create --key $publicKey
    Log-Message "Account created with Public Key: $publicKey." "SUCCESS"
} else {
    Log-Message "Failed to extract Public Key or create account." "ERROR"
}

# Step 4: Generate keys for dapper.pkey (also saved in the root of the project)
Log-Message "Generating keys for dapper.pkey..."
$keysOutput = flow keys generate
if ($keysOutput) {
    Log-Message "Keys generation output captured for dapper." "SUCCESS"
} else {
    Log-Message "Failed to generate keys for dapper.pkey." "ERROR"
}

# Step 5: Extract the Private Key and save it to dapper.pkey (in the root)
Log-Message "Extracting and saving Private Key for dapper.pkey..."
$matches = [regex]::Matches($keysOutput, "Private Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $privateKey = $matches[0].Groups[1].Value
    Set-Content -Path ".\dapper.pkey" -Value $privateKey -NoNewline -Encoding Ascii
    Log-Message "Private Key saved to dapper.pkey." "SUCCESS"
} else {
    Log-Message "Failed to extract Private Key for dapper.pkey." "ERROR"
}

# Step 6: Extract the Public Key and create another account
Log-Message "Extracting Public Key and creating account for dapper.pkey..."
$matches = [regex]::Matches($keysOutput, "Public Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $publicKey = $matches[0].Groups[1].Value
    flow accounts create --key $publicKey
    Log-Message "Account created with Public Key: $publicKey for dapper.pkey." "SUCCESS"
} else {
    Log-Message "Failed to extract Public Key or create account for dapper.pkey." "ERROR"
}

# Step 7: Deploy the project
Log-Message "Deploying the project..."
try {
    flow project deploy
    Log-Message "Project deployed." "SUCCESS"
} catch {
    Log-Message "Failed to deploy project: $_" "ERROR"
}

# Add Flow Balance to new accounts
flow transactions send .\utilities\fund_emulator.cdc 0xf8d6e0586b0a20c7 1000.0
Log-Message "fund_emulator transaction executed for 0xf8d6e0586b0a20c7."
$summarySteps += "Accounts funded."

flow scripts execute .\utilities\get_balance.cdc 0xf8d6e0586b0a20c7
Log-Message "get_balance script executed."

flow transactions send .\utilities\fund_emulator.cdc 0x179b6b1cb6755e31 1000.0
Log-Message "fund_emulator transaction executed for 0x179b6b1cb6755e31."

flow scripts execute .\utilities\get_balance.cdc 0x179b6b1cb6755e31
Log-Message "get_balance script executed for 0x179b6b1cb6755e31."

flow transactions send .\utilities\fund_emulator.cdc 0xf3fcd2c1a78f5eee 1000.0
Log-Message "fund_emulator transaction executed for 0xf3fcd2c1a78f5eee."

flow scripts execute .\utilities\get_balance.cdc 0xf3fcd2c1a78f5eee
Log-Message "get_balance script executed for 0x179b6b1cb6755e31."

# Log the completion of the script
Log-Message "Script completed."
