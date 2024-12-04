import subprocess
from collections import defaultdict
import json


# File paths
OPEN_SET_PLAY_TIER_MAPPING_FILE = "open_set_play_tier_mapping.json"
TRANSACTION_FILE_PATH = "./tiers/transactions/add_bulk_playid_tier.cdc"

# Mapping of tier text to their raw values
TIER_RAW_VALUES = {
    "common": 0,
    "fandom": 1,
    "rare": 2,
    "legendary": 3,
    "ultimate": 4,
}

# Function to execute the transaction for multiple play IDs in a single set and tier
def execute_transaction(set_id, play_ids, tier_raw_value):
    # Convert play_ids to a comma-separated string
    play_ids_str = ",".join(map(str, play_ids))

    # Construct the command
    command = [
        "flow",
        "transactions",
        "send",
        TRANSACTION_FILE_PATH,
        str(set_id),  # SetID
        f"[{play_ids_str}]",  # Array of PlayIDs
        str(tier_raw_value),  # TierRawValue
        "--network",
        "emulator",  # Adjust based on your network: emulator, testnet, mainnet
        "--signer",
        "emulator-account",  # Replace with your signer configuration
    ]

    # Debugging: Print the constructed command
    print(f"Running command: {' '.join(command)}")

    try:
        # Execute the Flow transaction
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
        )

        # Print transaction output and errors
        print(f"Transaction for setID {set_id} with tierRawValue {tier_raw_value}:")
        print("Transaction Output:\n", result.stdout)
        if result.stderr:
            print("Transaction Errors:\n", result.stderr)

    except subprocess.CalledProcessError as e:
        print(f"Failed to execute transaction for setID {set_id}. Error: {e}")

def main():
    # Load the open set play tier mapping
    with open(OPEN_SET_PLAY_TIER_MAPPING_FILE, "r") as f:
        open_set_play_tier_mapping = json.load(f)

    # Iterate over sets
    for set_id, play_tiers in open_set_play_tier_mapping.items():
        set_id = int(set_id)  # Ensure set ID is an integer

        # Group play IDs by tier
        tiered_play_ids = defaultdict(list)
        for play_id, tier_text in play_tiers.items():
            play_id = int(play_id)  # Ensure play ID is an integer
            tier_raw_value = TIER_RAW_VALUES.get(tier_text.lower())
            if tier_raw_value is None:
                raise ValueError(f"Unknown tier '{tier_text}' for play ID {play_id} in set {set_id}")
            tiered_play_ids[tier_raw_value].append(play_id)

        # Execute a transaction for each tier group in the set
        for tier_raw_value, play_ids in tiered_play_ids.items():
            print(f"Preparing transaction: SetID: {set_id}, PlayIDs: {play_ids}, TierRawValue: {tier_raw_value}")
            execute_transaction(set_id, play_ids, tier_raw_value)

if __name__ == "__main__":
    main()
