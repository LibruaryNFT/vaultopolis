# Deploy the project
flow-c1 project deploy

# Generate keys and store the output in a variable
$keysOutput = flow-c1 keys generate

# Log the keys generation output
Write-Output "Keys Generation Output:"
Write-Output $keysOutput

# Extract the Private Key and save it to justin.pkey
$matches = [regex]::Matches($keysOutput, "Private Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $privateKey = $matches[0].Groups[1].Value
    Write-Output "Extracted Private Key: $privateKey"
    
    # Save the private key to justin.pkey, ensuring no extra characters or encoding issues
    Set-Content -Path "justin.pkey" -Value $privateKey -NoNewline -Encoding Ascii
    Write-Output "Private Key saved to justin.pkey"
}

# Extract the Public Key and use it for the next command
$matches = [regex]::Matches($keysOutput, "Public Key\s+(\S+)")
if ($matches.Count -gt 0) {
    $publicKey = $matches[0].Groups[1].Value
    Write-Output "Extracted Public Key: $publicKey"
    
    # Create a new account using the extracted public key
    flow-c1 accounts create --key $publicKey
    Write-Output "Account created with Public Key: $publicKey"
}

# Send the setup_collection transaction
Write-Output "Sending setup_collection transaction..."
flow-c1 transactions send .\topshot\transactions\setup_collection.cdc --signer=justin
Write-Output "setup_collection transaction sent."

# Send the verify_collection transaction
Write-Output "Sending verify_collection transaction..."
flow-c1 transactions send .\topshot\transactions\verify_collection.cdc --signer=justin
Write-Output "verify_collection transaction sent."

# Execute the verify_collection script
Write-Output "Executing verify_collection script..."
flow-c1 scripts execute .\topshot\scripts\verify_collection.cdc 0x179b6b1cb6755e31
Write-Output "verify_collection script executed."

# Adding Flow Balance to new account
Write-Output "Executing fund_emulator transaction for 0xf8d6e0586b0a20c7..."
flow-c1 transactions send .\utilities\fund_emulator.cdc 0xf8d6e0586b0a20c7 1000.0
Write-Output "fund_emulator transaction executed for 0xf8d6e0586b0a20c7."

# Verifying the new account balance
Write-Output "Executing get_balance script..."
flow-c1 scripts execute .\utilities\get_balance.cdc 0xf8d6e0586b0a20c7
Write-Output "get_balance script executed."

# Adding Flow Balance to new account
Write-Output "Executing fund_emulator transaction for 0x179b6b1cb6755e31..."
flow-c1 transactions send .\utilities\fund_emulator.cdc 0x179b6b1cb6755e31 1000.0
Write-Output "fund_emulator transaction executed for 0x179b6b1cb6755e31."

# Verifying the new account balance
Write-Output "Executing get_balance script for 0x179b6b1cb6755e31..."
flow-c1 scripts execute .\utilities\get_balance.cdc 0x179b6b1cb6755e31
Write-Output "get_balance script executed for 0x179b6b1cb6755e31."

# Sending create_sets1 transaction
Write-Output "Sending transaction to create sets from create_sets1.cdc..."
flow-c1 transactions send ./topshot/transactions/create_sets1.cdc
Write-Output "create_sets1 transaction sent."

# Sending create_sets2 transaction
Write-Output "Sending transaction to create sets from create_sets2.cdc..."
flow-c1 transactions send ./topshot/transactions/create_sets2.cdc
Write-Output "create_sets2 transaction sent."

# Sending create_sets3 transaction
Write-Output "Sending transaction to create sets from create_sets3.cdc..."
flow-c1 transactions send ./topshot/transactions/create_sets3.cdc
Write-Output "create_sets3 transaction sent."

# Sending create_sets4 transaction
Write-Output "Sending transaction to create sets from create_sets4.cdc..."
flow-c1 transactions send ./topshot/transactions/create_sets4.cdc
Write-Output "create_sets4 transaction sent."

# End the script here
exit