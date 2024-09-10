import subprocess
import json
import os
import tempfile

# Load metadata from JSON file
with open('play_metadata.json', 'r', encoding='utf-8') as f:
    play_metadata = json.load(f)

# Convert the dictionary of plays into a list of dictionaries, retaining the play IDs
play_metadata_list = [{"playID": int(play_id), "metadata": metadata} for play_id, metadata in play_metadata.items()]

# Chunk size: Adjust as needed to avoid command-line limits
CHUNK_SIZE = 5  # Adjust this value based on your needs

def chunked(iterable, size):
    """Yield successive n-sized chunks from iterable."""
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]

# Process each chunk
for chunk in chunked(play_metadata_list, CHUNK_SIZE):
    # Prepare the single argument containing the chunk of metadata
    metadata_arg = {
        "type": "Array",
        "value": [
            {
                "type": "Dictionary",
                "value": [
                    {"key": {"type": "UInt32", "value": str(play["playID"])}, "value": {"type": "Dictionary", "value": [
                        {"key": {"type": "String", "value": k}, "value": {"type": "String", "value": v}}
                        for k, v in play["metadata"].items()
                    ]}}
                ]
            }
            for play in chunk
        ]
    }

    # Write metadata_arg to a temporary JSON file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode='w', encoding='utf-8') as temp_file:
        json.dump([metadata_arg], temp_file, ensure_ascii=False)
        temp_file_name = temp_file.name
    
    # Read the content of the temporary file to pass it as a string
    with open(temp_file_name, 'r', encoding='utf-8') as f:
        metadata_json = f.read()

    # Execute the Flow transaction using the JSON string
    result = subprocess.run([
        'flow', 'transactions', 'send', './topshot/transactions/create_plays.cdc',
        '--args-json', metadata_json,
        '--network', 'emulator'
    ], capture_output=True, text=True)

    # Output the result
    print("Transaction Output:\n", result.stdout)
    print("Transaction Errors:\n", result.stderr)

    # Clean up the temporary file
    os.remove(temp_file_name)