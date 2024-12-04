import subprocess
import json

# Your account address and signer alias
your_account_address = '0x332ffc0ae9bba9c1'  # Your signer's address
recipient_address = '0xa1d297b2610cba6a'    # Recipient's address
signer_alias = 'testnet-account'             # Your signer alias in Flow CLI

# Paths to your scripts and transactions
get_collection_ids_script = './sharding/scripts/get_collection_ids.cdc'
batch_transfer_transaction = './sharding/transactions/batch_from_sharded.cdc'

# Network
network = 'testnet'

# Batch size
batch_size = 50  # Adjust based on transaction limits

# Function to run a Flow script and return the result
def run_flow_script(script_path, args):
    command = [
        'flow', 'scripts', 'execute', script_path,
        '--network', network,
        '--output', 'json',
    ] + args
    result = subprocess.run(command, capture_output=True, text=True, encoding='utf-8')
    if result.returncode != 0:
        print("Error executing script:")
        print(result.stderr)
        return None
    else:
        output = result.stdout.strip()
        try:
            # Parse the JSON output
            output_json = json.loads(output)
            # Extract the actual values
            values = output_json['value']
            if isinstance(values, list):
                # Extract 'value' from each item in the list
                return [int(item['value']) for item in values]
            else:
                return int(values['value'])
        except json.JSONDecodeError:
            print("Error parsing script output:")
            print(output)
            return None

# Function to send a Flow transaction
def send_flow_transaction(transaction_path, args):
    command = [
        'flow', 'transactions', 'send', transaction_path,
        '--network', network,
        '--signer', signer_alias,
    ] + args
    result = subprocess.run(command, capture_output=True, text=True, encoding='utf-8')
    if result.returncode != 0:
        print("Error sending transaction:")
        print(result.stderr)
        return False
    else:
        print("Transaction sent successfully:")
        print(result.stdout)
        return True

# Step 1: Get all NFT IDs
print("Retrieving all NFT IDs from your sharded collection...")
nft_ids = run_flow_script(get_collection_ids_script, [your_account_address])

if nft_ids is None:
    print("Failed to retrieve NFT IDs.")
    exit(1)

print(f"Total NFTs to transfer: {len(nft_ids)}")

# Optional: Save the NFT IDs to a file
with open('nft_ids.json', 'w') as f:
    json.dump(nft_ids, f)
    print("Saved NFT IDs to nft_ids.json")

# Step 2: Batch transfer NFTs
def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

nft_id_batches = list(chunks(nft_ids, batch_size))

for idx, batch in enumerate(nft_id_batches):
    print(f"Transferring batch {idx + 1}/{len(nft_id_batches)}: {batch}")

    # Convert the batch of NFT IDs to a comma-separated string
    batch_ids_str = ",".join([str(nft_id) for nft_id in batch])

    # Prepare the arguments for the transaction
    args = [
        recipient_address,
        f"[{batch_ids_str}]",
    ]

    # Execute the transaction
    success = send_flow_transaction(batch_transfer_transaction, args)

    if not success:
        print(f"Failed to transfer batch {idx + 1}. Exiting.")
        break  # Optionally continue with the next batch

    # Optionally, wait for transaction to be sealed before proceeding
    # You can implement a function to check transaction status and wait if needed

print("Transfer process completed.")
