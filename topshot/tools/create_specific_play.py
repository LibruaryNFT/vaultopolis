import subprocess
import json
import os
import tempfile

# Metadata for the new play with exact formatting
play_metadata = {
    "JerseyNumber": "8",
    "AwayTeamName": "Denver Nuggets",
    "PrimaryPosition": "SG",
    "FullName": "Bogdan Bogdanovic",
    "DateOfMoment": "2019-10-29 02:00:00 +0000 UTC",
    "HomeTeamScore": "94",
    "Weight": "220",
    "PlayCategory": "Assist",
    "HomeTeamName": "Sacramento Kings",
    "TotalYearsExperience": "2",
    "Height": "78",
    "PlayType": "Assist",
    "PlayerPosition": "G",
    "Birthdate": "1992-08-18",
    "AwayTeamScore": "101",
    "Tagline": "Sacramento Kings guard Bogdan Bogdanovic puts the ball on the deck before throwing the beautiful over-the-head pass for a spot-up three from the corner against the Denver Nuggets on October 28, 2019.",
    "TeamAtMomentNBAID": "1610612758",
    "DraftRound": "1",
    "LastName": "Bogdanovic",
    "TeamAtMoment": "Sacramento Kings",
    "FirstName": "Bogdan",
    "DraftTeam": "Phoenix Suns",
    "NbaSeason": "2019-20",
    "Birthplace": "Belgrade,, SRB",
    "DraftYear": "2014",
    "DraftSelection": "27"
}

# Prepare the metadata for the transaction
metadata_arg = {
    "type": "Dictionary",
    "value": [
        {"key": {"type": "String", "value": k}, "value": {"type": "String", "value": v}}
        for k, v in play_metadata.items()
    ]
}

# Write metadata_arg to a temporary JSON file
with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode='w', encoding='utf-8') as temp_file:
    json.dump([metadata_arg], temp_file, ensure_ascii=False)
    temp_file_name = temp_file.name

# Read the content of the temporary file to pass it as a string
with open(temp_file_name, 'r', encoding='utf-8') as f:
    metadata_json = f.read()

# Execute the Flow transaction using the JSON string on Testnet and sign it with the emulator-account
result = subprocess.run([
    'flow', 'transactions', 'send', './topshot/transactions/create_plays.cdc',
    '--args-json', metadata_json,
    '--signer', 'testnet-account',  # Use emulator-account as the signer
    '--network', 'testnet'  # Set the network to testnet
], capture_output=True, text=True, encoding='utf-8')  # Explicitly set encoding to 'utf-8'

# Output the result
print("Transaction Output:\n", result.stdout)
print("Transaction Errors:\n", result.stderr)

# Clean up the temporary file
os.remove(temp_file_name)
