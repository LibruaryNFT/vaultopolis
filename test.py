import json
import re

# Step 1: Read the raw output file
with open("output.txt", "r") as f:
    raw_data = f.read()

# Log the raw data for debugging
print("Raw data read from file:")
print(raw_data)

# Step 2: Locate the "Result:" section robustly
# This regex accounts for extra spaces and newlines
match = re.search(r"Result:\s*({.*)", raw_data, re.DOTALL | re.IGNORECASE)
if match:
    raw_json_like = match.group(1).strip()  # Get the JSON-like part starting with '{' and strip spaces
    print("\nExtracted JSON-like data:")
    print(raw_json_like)
else:
    raise ValueError("Result section not found in output.txt. Please check the file content.")

# Step 3: Clean the JSON-like data
# Fix unquoted keys (e.g., 0x4ab8b294112f182c -> "0x4ab8b294112f182c")
cleaned_json = re.sub(r"(\b0x[a-fA-F0-9]+)\s*:", r'"\1":', raw_json_like)

# Log the cleaned JSON for debugging
print("\nCleaned JSON-like data:")
print(cleaned_json)

# Step 4: Ensure proper JSON formatting
try:
    # Parse the cleaned JSON
    data = json.loads(cleaned_json)
except json.JSONDecodeError as e:
    raise ValueError(f"Failed to parse cleaned JSON: {e}")

# Step 5: Count NFT IDs for each account
nft_counts = {account: len(nft_ids) for account, nft_ids in data.items()}

# Step 6: Print counts and save to a file
print("\nNFT Counts per Account:")
for account, count in nft_counts.items():
    print(f"Account: {account}, NFT Count: {count}")

# Save the counts to a JSON file
with open("nft_counts.json", "w") as f:
    json.dump(nft_counts, f, indent=4)

print("\nNFT counts saved to nft_counts.json.")
