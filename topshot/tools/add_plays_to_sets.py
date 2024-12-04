import json
import subprocess

def chunked(iterable, size):
    """Yield successive n-sized chunks from iterable."""
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]

# Load the set and play ID mappings from the JSON file
with open('set_play_mapping.json') as f:
    set_play_mapping = json.load(f)

# Set the chunk size (e.g., 10 play IDs per transaction)
chunk_size = 10

# Iterate through each setID and its corresponding playIDs
for setID, playIDs in set_play_mapping.items():
    # Process playIDs in chunks
    for playID_chunk in chunked(playIDs, chunk_size):
        # Prepare the setID and playID_chunk as command-line arguments
        set_id_str = str(setID)
        play_ids_str = "[" + ",".join(map(str, playID_chunk)) + "]"

        # Construct the command
        command = [
            'flow', 'transactions', 'send', './topshot/transactions/add_plays_to_sets.cdc',
            set_id_str, play_ids_str, '--signer', 'dapper'
        ]

        # Execute the Flow transaction
        result = subprocess.run(command, capture_output=True, text=True)

        # Output the result
        print(f"Transaction for setID {setID} with playIDs {playID_chunk}:\n", result.stdout)
        print(f"Errors (if any) for setID {setID} with playIDs {playID_chunk}:\n", result.stderr)