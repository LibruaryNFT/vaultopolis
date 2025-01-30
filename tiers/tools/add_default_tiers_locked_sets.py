import subprocess
import json
import time
import sys
from typing import Dict, Optional, Tuple

# Tier mappings
tier_mapping = {
    "common": 0,
    "fandom": 1,
    "rare": 2,
    "legendary": 3,
    "ultimate": 4,
}

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
    120: "rare", 121: "legendary", 122: "legendary", 123: "legendary", 124: "common", 
    125: "common", 126: "common", 127: "rare", 128: "rare",
    129: "common", 130: "rare", 131: "legendary", 132: "common",133: "common",
    134: "rare",135: "rare", 136: "rare", 137: "common", 138: "fandom", 139: "legendary",
    140: "ultimate", 142: "rare", 143: "fandom", 144: "common", 145: "common", 146: "rare",
    147: "legendary", 148: "rare", 149: "rare", 150: "rare", 151: "ultimate",
    152: "rare", 153: "legendary", 154: "legendary", 157: "rare", 159: "rare", 160: "legendary", 161: "legendary",
    162: "legendary", 164: "common", 165: "ultimate", 166: "rare", 
    167: "fandom", 169: "legendary", 170: "rare", 171: "common", 
    172: "rare", 173: "rare",
    
}

# Configuration
TRANSACTION_FILE_PATH = "C:/Code/vaultopolis/tiers/transactions/add_or_update_default_tier.cdc"
NETWORK = "mainnet"
SIGNER_ACCOUNT = "mainnet-account2"
ACCOUNT_ADDRESS = "b1788d64d512026d"  # Your account address

def get_latest_sequence_number(account_address: str) -> Optional[int]:
    """Get the latest sequence number for an account."""
    try:
        result = subprocess.run([
            'flow', 'accounts', 'get', account_address,
            '--network', NETWORK
        ], capture_output=True, text=True, encoding='utf-8')
        
        if result.returncode != 0:
            print(f"Error getting account info: {result.stderr}")
            return None
            
        lines = result.stdout.split('\n')
        for line in lines:
            if 'Sequence Number' in line:
                # Extract number after "Sequence Number" and remove whitespace
                seq_num = line.split('Sequence Number')[1].strip()
                # Remove any remaining whitespace and get the number
                seq_num = seq_num.strip().strip(':').strip()
                return int(seq_num)
        
        print("Could not find sequence number in output:")
        print(result.stdout)
        return None
            
    except Exception as e:
        print(f"Error fetching sequence number: {str(e)}")
        print(f"Full error details: {repr(e)}")
        return None
    
def submit_tier_transaction(set_id: int, tier_name: str, sequence_number: int) -> Tuple[bool, str]:
    """Submit a single tier transaction."""
    tier_value = tier_mapping.get(tier_name)
    if tier_value is None:
        return False, f"Invalid tier name: {tier_name}"

    args = [
        {"type": "UInt32", "value": str(set_id)},
        {"type": "UInt8", "value": str(tier_value)}
    ]
    args_json = json.dumps(args)

    try:
        cmd = [
            'flow', 'transactions', 'send', TRANSACTION_FILE_PATH,
            '--args-json', args_json,
            '--network', NETWORK,
            '--signer', SIGNER_ACCOUNT,
            '--sequence-number', str(sequence_number)
        ]
        
        print(f"\nExecuting transaction for setID {set_id} ({tier_name}):")
        print(f"Sequence number: {sequence_number}")
        
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        
        if result.returncode == 0:
            print("✓ Transaction successful")
            return True, "Success"
        else:
            error_msg = result.stderr or result.stdout
            print(f"✗ Transaction failed: {error_msg}")
            return False, error_msg

    except Exception as e:
        error_msg = str(e)
        print(f"✗ Error executing transaction: {error_msg}")
        return False, error_msg

def main():
    """Main execution function."""
    print("Starting tier update process...")
    
    # Get initial sequence number
    sequence_number = get_latest_sequence_number(ACCOUNT_ADDRESS)
    if sequence_number is None:
        print("Failed to get initial sequence number. Exiting.")
        return
    
    print(f"Starting with sequence number: {sequence_number}")
    
    # Process each tier
    for set_id, tier_name in default_tiers.items():
        print(f"\nProcessing set {set_id} with tier {tier_name}")
        
        # Submit transaction
        success, message = submit_tier_transaction(set_id, tier_name, sequence_number)
        
        if success:
            sequence_number += 1
            time.sleep(2)  # Delay between successful transactions
        else:
            user_input = input(f"Transaction failed. Continue? (y/n): ")
            if user_input.lower() != 'y':
                print("Stopping process.")
                break
            sequence_number = get_latest_sequence_number(ACCOUNT_ADDRESS)
            if sequence_number is None:
                print("Failed to get new sequence number. Exiting.")
                break

        # Option to pause or quit
        user_input = input("Press Enter to continue, 'q' to quit: ")
        if user_input.lower() == 'q':
            print("Process stopped by user.")
            break

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nProcess interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\nUnexpected error: {str(e)}")
        sys.exit(1)