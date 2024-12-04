# Function to log output with timestamps and statuses
function Log-Message {
    param(
        [string]$message,
        [string]$status = "INFO",
        [string]$response = ""
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - [$status] - $message"

    if ($response -ne "") {
        $logEntry += "`n$response"
    }

    Write-Output $logEntry
    $logEntry | Add-Content -Path ".\deployment\logs\deployment.log"
}

# Log script start
Log-Message "Script execution started."

# Regex patterns for extracting keys
$privateKeyRegex = "Private Key\s+([0-9a-fA-F]{64})"
$publicKeyRegex = "Public Key\s+([0-9a-fA-F]+)"

# Function to generate keys, save private key, and create an account
function Setup-Account {
    param(
        [string]$keyFileName,
        [string]$accountName
    )
    Log-Message "Generating keys for $keyFileName..."
    $keysOutput = flow keys generate
    if ($keysOutput) {
        Log-Message "Keys generation output captured for $keyFileName." "SUCCESS" $keysOutput
    } else {
        Log-Message "Failed to generate keys for $keyFileName." "ERROR"
        exit
    }

    Log-Message "Extracting and saving Private Key for $keyFileName..."
    $matches = [regex]::Matches($keysOutput, $privateKeyRegex)
    if ($matches.Count -gt 0) {
        $privateKey = $matches[0].Groups[1].Value
        Set-Content -Path ".\$keyFileName" -Value $privateKey -NoNewline -Encoding Ascii
        Log-Message "Private Key saved to $keyFileName." "SUCCESS"
    } else {
        Log-Message "Failed to extract Private Key for $keyFileName." "ERROR"
        exit
    }

    Log-Message "Extracting Public Key and creating account for $keyFileName..."
    $matches = [regex]::Matches($keysOutput, $publicKeyRegex)
    if ($matches.Count -gt 0) {
        $publicKey = $matches[0].Groups[1].Value
        $accountCreationOutput = flow accounts create --key $publicKey
        Log-Message "Account created with Public Key: $publicKey for $keyFileName." "SUCCESS" $accountCreationOutput
    } else {
        Log-Message "Failed to extract Public Key for $keyFileName." "ERROR"
        exit
    }
}

# Function to fund and verify an account
function Fund-And-Verify-Account {
    param(
        [string]$accountAddress,
        [float]$amount
    )
    $formattedAmount = "{0:N1}" -f $amount -replace ",", "" # Ensures UFix64 format without commas
    Log-Message "Funding account $accountAddress with $formattedAmount FLOW..."
    try {
        $fundOutput = flow transactions send .\utilities\fund_emulator.cdc $accountAddress $formattedAmount
        Log-Message "Account $accountAddress funded with $formattedAmount FLOW." "SUCCESS" $fundOutput
    } catch {
        Log-Message "Failed to fund account $accountAddress." "ERROR" $_.Exception.Message
        exit
    }

    Log-Message "Verifying balance for account $accountAddress..."
    try {
        $balanceOutput = flow scripts execute .\utilities\get_balance.cdc $accountAddress
        Log-Message "Balance verified for account $accountAddress." "SUCCESS" $balanceOutput
    } catch {
        Log-Message "Failed to verify balance for account $accountAddress." "ERROR" $_.Exception.Message
        exit
    }
}



# Step 1: Setup justin.pkey account
Setup-Account "justin.pkey" "Justin"

# Step 2: Setup dapper.pkey account
Setup-Account "dapper.pkey" "Dapper"

# Step 3: Fund and verify accounts
Fund-And-Verify-Account "0xf8d6e0586b0a20c7" 1000.0
Fund-And-Verify-Account "0x179b6b1cb6755e31" 1000.0
Fund-And-Verify-Account "0xf3fcd2c1a78f5eee" 1000.0

# Log script completion
Log-Message "Script execution completed successfully."
