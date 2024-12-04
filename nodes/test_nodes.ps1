# Define the base command and file paths
$baseCommand = "flow scripts execute ./topshot/scripts/get_collection.cdc 0xa1d297b2610cba6a --network="
$logFile = "./outputs/network_results.log"  # Single log file for all outputs

# Create the output directory if it doesn't exist
$outputDir = "./outputs"
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# Ensure the log file is empty before starting
if (Test-Path -Path $logFile) {
    Remove-Item -Path $logFile
}
New-Item -ItemType File -Path $logFile | Out-Null

# Loop through network IDs 1 to 111
for ($network = 1; $network -le 111; $network++) {
    # Construct the command with the current network ID
    $command = "$baseCommand$network"

    # Execute the command and capture the output
    try {
        $output = Invoke-Expression $command
        $status = "Success"
    } catch {
        $output = $_.Exception.Message
        $status = "Error"
    }

    # Format the log entry
    $logEntry = @"
Network ID: $network
Status: $status
Output:
$output

"@  # Multi-line string

    # Append the log entry to the file
    Add-Content -Path $logFile -Value $logEntry

    Write-Host "Logged output for network $network"
}

Write-Host "Execution complete. Log saved to $logFile."
