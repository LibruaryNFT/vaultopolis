
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

# Send mint_TSHOT transaction
 # 1- common
 # 2 - rare
 # 3 legendary
 # 4 - common
 # 5 - legendary
 # 6 - common
 # 7 - ultimate

Log-Message "Sending swap_nfts_for_tshot transaction with common"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [1] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its an ultimate
Log-Message "Sending swap_nfts_for_tshot transaction with ultimate"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [2] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# Send mint_TSHOT transaction - Should fail because its legendary
Log-Message "Sending swap_nfts_for_tshot transaction with legendary"
flow transactions send ./momentswap/transactions/swap_nfts_for_tshot.cdc [60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300] --signer=justin
Log-Message "mint_TSHOT transaction sent."
$summarySteps += "TSHOT minted."

# User no longer has nft id 4 and now has a TSHOT balance of 1.0
Log-Message "Getting collection IDs and verifying balance for 0x179b6b1cb6755e31..."
flow scripts execute ./topshot/scripts/get_collection_ids.cdc 0x179b6b1cb6755e31
flow scripts execute ./momentswap/scripts/verify_balance_tshot.cdc 0x179b6b1cb6755e31
Log-Message "Collection IDs and balance verified for 0x179b6b1cb6755e31."
$summarySteps += "Collection IDs and balances verified for both accounts."

flow scripts execute ./sharding/scripts/verify_collection_details.cdc
# 
flow transactions send ./momentswap/transactions/commit_swap.cdc 1.0 --signer=justin

flow scripts execute ./momentswap/scripts/verify_receipt.cdc 0x179b6b1cb6755e31

flow transactions send ./momentswap/transactions/reveal_swap.cdc 0x179b6b1cb6755e31 --signer=justin

flow scripts execute ./sharding/scripts/get_collection_ids.cdc 0xf8d6e0586b0a20c7

$summarySteps += "Final verifications completed."

# Script completion
Log-Message "Script completed. Summary:"

# Print out the summary
$summarySteps | ForEach-Object { Log-Message "$_" }
