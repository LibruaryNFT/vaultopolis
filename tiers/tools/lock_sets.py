import subprocess
import json

# Ranges of sets to lock
set_ranges = [
    range(1, 74),  # 1 to 73 inclusive
    range(75, 100),  # 75 to 99 inclusive
    range(101, 109),  # 101 to 108 inclusive
    range(110, 114),  # 110 to 113 inclusive
    range(115, 117),  # 115 to 116 inclusive
    range(118),  # 118 inclusive
    range(120, 123),  # 118 inclusive
]

# Flatten the ranges into a single list of set IDs
set_ids = [set_id for r in set_ranges for set_id in r]

# Path to the Cadence transaction file
transaction_file_path = "C:/Code/fungify/topshot/transactions/lock_set.cdc"

# Lock each set
for set_id in set_ids:
    # Prepare the arguments for the transaction
    args = [{"type": "UInt32", "value": str(set_id)}]

    # Convert the arguments to JSON format
    args_json = json.dumps(args)

    # Execute the Flow transaction
    result = subprocess.run([
        'flow', 'transactions', 'send', transaction_file_path,
        '--args-json', args_json,
        '--network', 'emulator',  # Change to 'testnet' or 'mainnet' if needed
        '--signer', 'dapper'  # Replace 'dapper' with your signer configuration
    ], capture_output=True, text=True)

    # Output the result of the transaction
    print(f"Transaction for setID {set_id}:")
    print("Transaction Output:\n", result.stdout)
    print("Transaction Errors:\n", result.stderr)
