import subprocess
import json

# Generate play IDs from 1 to 5511
play_id_list = list(range(1, 5512))

# Chunk size: Adjust as needed to avoid command-line limits
chunk_size = 15  # Adjust this value based on your needs

def chunked(iterable, size):
    """Yield successive n-sized chunks from iterable."""
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]

# Process each chunk
for chunk in chunked(play_id_list, chunk_size):
    # Prepare the playIDList argument
    play_id_list_arg = {
        "type": "Array",
        "value": [{"type": "UInt32", "value": str(play_id)} for play_id in chunk]
    }

    # Convert the argument to a JSON string
    args_json = json.dumps([play_id_list_arg])

    # Execute the Flow transaction using the JSON string
    result = subprocess.run([
        'flow-c1', 'transactions', 'send', './topshot/transactions/create_plays_minimal.cdc',
        '--args-json', args_json,
        '--network', 'emulator'
    ], capture_output=True, text=True)

    # Output the result
    print("Transaction Output:\n", result.stdout)
    print("Transaction Errors:\n", result.stderr)