# Initialize an array to store summary steps
$summarySteps = @()

# Function to log output with timestamps and optional responses
function Log-Message {
    param(
        [string]$message,
        [string]$status = "INFO",  # Default status is INFO
        [string]$response = ""    # Optional response content
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

# Function to measure and log execution time for a block of code
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

# Log the start of the script
Log-Message "Script execution started."

# Step 1: Send create_sets transactions
$sets = @("create_sets1.cdc", "create_sets2.cdc", "create_sets3.cdc", "create_sets4.cdc", "create_sets5.cdc")
foreach ($set in $sets) {
    Measure-ExecutionTime "Sending transaction to create sets from $set" {
        flow transactions send "./topshot/transactions/$set" --signer=dapper
    }
}
$summarySteps += "Sets created."

# Step 2: Create plays with minimal data
Measure-ExecutionTime "Creating plays with minimal data" {
    python .\topshot\tools\create_plays_minimal.py
}

# Step 3: Add plays to sets
Measure-ExecutionTime "Adding plays to sets" {
    python .\topshot\tools\add_plays_to_sets.py
}

# Print out the summary
Log-Message "Summary of steps completed:"
$summarySteps | ForEach-Object { Log-Message $_ }

# Log the completion of the script
Log-Message "Script execution completed."
