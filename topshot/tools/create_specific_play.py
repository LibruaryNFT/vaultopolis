import subprocess
import json
import os
import tempfile

# Metadata for T.J. Warren's play
play_id = 98
play_metadata = {
    "Birthplace": "Durham, NC, USA",
    "LastName": "Warren",
    "DraftTeam": "Phoenix Suns",
    "HomeTeamScore": "98",
    "Weight": "220",
    "AwayTeamName": "Indiana Pacers",
    "FirstName": "T.J.",
    "Birthdate": "1993-09-05",
    "DraftRound": "1",
    "DateOfMoment": "2020-02-22 00:30:00 +0000 UTC",
    "DraftYear": "2014",
    "PrimaryPosition": "SF",
    "DraftSelection": "14",
    "Height": "80",
    "PlayType": "Rim",
    "JerseyNumber": "1",
    "PlayerPosition": "F",
    "FullName": "T.J. Warren",
    "Tagline": "Indiana Pacers forward T.J. Warren elevates in traffic, absorbs the contact, and finishes the tough reverse layup against the New York Knicks on February 21, 2020.",
    "AwayTeamScore": "106",
    "TotalYearsExperience": "5",
    "TeamAtMoment": "Indiana Pacers",
    "HomeTeamName": "New York Knicks",
    "TeamAtMomentNBAID": "1610612754",
    "PlayCategory": "Layup",
    "NbaSeason": "2019-20"
}

# Prepare metadata with play_id as the key in a dictionary
play_data = {
    play_id: play_metadata
}

# Convert play_data to a JSON string that matches Flow's {String: String} format for Dictionary input
metadata_arg = {
    "type": "Dictionary",
    "value": [
        {"key": {"type": "String", "value": k}, "value": {"type": "String", "value": v}}
        for k, v in play_metadata.items()
    ]
}

# Write the metadata_arg to a temporary JSON file to use as an argument for Flow CLI
with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode='w', encoding='utf-8') as temp_file:
    json.dump([metadata_arg], temp_file, ensure_ascii=False)
    temp_file_name = temp_file.name

# Read the content of the temporary file to pass it as a string
with open(temp_file_name, 'r', encoding='utf-8') as f:
    metadata_json = f.read()

# Execute the Flow transaction using the JSON string on Testnet and sign it with the testnet account
result = subprocess.run([
    'flow', 'transactions', 'send', './topshot/transactions/create_play.cdc',
    '--args-json', metadata_json,
    '--signer', 'testnet-account',  # Replace with your correct account alias
    '--network', 'testnet'  # Use 'emulator' if running locally
], capture_output=True, text=True, encoding='utf-8')

# Parse and print the result in the desired format
output = {
    play_id: play_metadata
}
print("Result:", json.dumps(output, indent=2))

# Clean up the temporary file
os.remove(temp_file_name)
