# Log-Message function to include execution details and responses
function Log-Message {
    param(
        [string]$message,
        [string]$status = "INFO",  # Default status is INFO
        [string]$response = ""    # Optional response to include in logs
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "$timestamp - [$status] - $message"

    # Append response to log if provided
    if ($response -ne "") {
        $logEntry += "`n$response"
    }

    Write-Output $logEntry
    $logEntry | Add-Content -Path ".\deployment\logs\deployment.log"
}

# Measure-ExecutionTime function to time execution and log responses
function Measure-ExecutionTime {
    param(
        [string]$stepDescription,
        [scriptblock]$codeBlock
    )
    $start = Get-Date
    Log-Message "$stepDescription started."
    try {
        $response = &$codeBlock
        $status = "SUCCESS"
    } catch {
        $response = $_.Exception.Message
        $status = "ERROR"
    }
    $end = Get-Date
    $duration = ($end - $start).TotalSeconds
    Log-Message "$stepDescription completed in $duration seconds." $status $response
}

# Script execution begins
Log-Message "Script execution started."

# Step 1: Deploy contracts
Measure-ExecutionTime "Deploying contracts" {
    flow project deploy
}

# Step 2: Setup sharded collection
Measure-ExecutionTime "Executing setup_sharded_collection transaction" {
    flow transactions send .\sharding\transactions\setup_sharded_collection.cdc 50 true
}

# Step 3: Verify sharded collection details
Measure-ExecutionTime "Verifying sharded collection details" {
    flow scripts execute .\sharding\scripts\verify_collection_details.cdc 0xf8d6e0586b0a20c7
}

# Step 4: Setup TopShot collection for `justin`
Measure-ExecutionTime "Setting up TopShot collection for justin" {
    flow transactions send .\topshot\transactions\setup_collection.cdc --signer=justin
}

# Step 5: Verify TopShot collection for `justin`
Measure-ExecutionTime "Verifying TopShot collection for justin" {
    flow scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
}

# Step 6: Setup TSHOT vault
Measure-ExecutionTime "Setting up TSHOT vault" {
    flow transactions send ./momentswap/transactions/setup_vault_tshot.cdc
}

# Step 7: Verify TSHOT vault
Measure-ExecutionTime "Verifying TSHOT vault for emulator account" {
    flow scripts execute ./momentswap/scripts/verify_vault_tshot.cdc 0xf8d6e0586b0a20c7
}

# Step 8: Setup TSHOT vault for `justin`
Measure-ExecutionTime "Setting up TSHOT vault for justin" {
    flow transactions send ./momentswap/transactions/setup_vault_tshot.cdc --signer=justin
}

# Step 9: Verify TSHOT vault for `justin`
Measure-ExecutionTime "Verifying TSHOT vault for justin" {
    flow scripts execute ./momentswap/scripts/verify_vault_tshot.cdc 0x179b6b1cb6755e31
}

# Log script completion
Log-Message "Script execution completed."
