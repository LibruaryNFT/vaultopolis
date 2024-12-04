


import subprocess
import os
import json  # Ensure json is imported

# Full default tiers data
default_tiers = {
    1: "ultimate", 2: "common", 3: "ultimate", 4: "legendary", 5: "rare",
    6: "rare", 7: "rare", 8: "legendary", 9: "rare", 10: "rare",
    11: "rare", 12: "legendary", 13: "rare", 14: "common", 15: "rare",
    16: "rare", 17: "rare", 18: "rare", 19: "rare", 20: "legendary",
    21: "rare", 22: "common", 23: "legendary", 24: "rare", 25: "rare",
    26: "common", 27: "ultimate", 28: "legendary", 29: "rare", 30: "rare",
    31: "legendary", 32: "common", 33: "common", 34: "common", 35: "rare",
    36: "common", 37: "rare", 38: "rare", 39: "common", 40: "rare",
    41: "legendary", 42: "ultimate", 43: "fandom", 44: "common", 45: "fandom",
    46: "rare", 47: "rare", 48: "common", 49: "fandom", 50: "legendary",
    51: "common", 52: "ultimate", 53: "legendary", 54: "rare", 55: "rare",
    56: "fandom", 57: "legendary", 58: "common", 59: "common", 60: "common",
    61: "legendary", 62: "fandom", 63: "rare", 64: "rare", 65: "common",
    66: "fandom", 67: "common", 68: "rare", 69: "legendary", 70: "fandom",
    71: "rare", 72: "common", 73: "common", 75: "rare", 76: "fandom",
    77: "fandom", 78: "fandom", 79: "rare", 80: "fandom", 81: "rare",
    82: "legendary", 83: "rare", 84: "common", 85: "rare", 86: "fandom",
    87: "fandom", 88: "fandom", 89: "rare", 90: "common", 91: "common",
    92: "common", 93: "rare", 94: "rare", 95: "rare", 96: "legendary",
    97: "rare", 98: "common", 99: "rare", 101: "fandom", 102: "rare",
    103: "legendary", 104: "common", 105: "common", 106: "legendary",
    107: "fandom", 108: "common", 110: "legendary", 111: "common",
    112: "rare", 113: "common", 115: "rare", 116: "legendary", 118: "legendary",
    120: "rare", 121: "legendary", 122: "legendary",
    123: "legendary", 
}


# Mapping for tier names to their raw values
tier_mapping = {
    "common": 0,
    "fandom": 1,
    "rare": 2,
    "legendary": 3,
    "ultimate": 4,
}

# Correct path to the Cadence transaction file
transaction_file_path = "C:/Code/fungify/tiers/transactions/add_or_update_default_tier.cdc"

# Submit each setID and tierRawValue as a separate transaction
for set_id, tier_name in default_tiers.items():
    tier_value = tier_mapping.get(tier_name)
    if tier_value is None:
        raise ValueError(f"Invalid tier name: {tier_name}")

    # Prepare arguments for setID and tierRawValue
    args = [
        {"type": "UInt32", "value": str(set_id)},
        {"type": "UInt8", "value": str(tier_value)},
    ]

    # Convert the arguments to JSON format
    args_json = json.dumps(args)

    # Execute the Flow transaction
    result = subprocess.run([
        'flow', 'transactions', 'send', transaction_file_path,
        '--args-json', args_json,
        '--network', 'emulator',  # Use 'testnet' or 'mainnet' as needed
        '--signer', 'emulator-account'  # Replace with your signer configuration
    ], capture_output=True, text=True)

    # Output the result of the transaction
    print(f"Transaction for setID {set_id}:")
    print("Transaction Output:\n", result.stdout)
    print("Transaction Errors:\n", result.stderr)
