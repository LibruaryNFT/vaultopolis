# Fungify

## TopShot Emulator Setup
This setup will get you started with the TopShot emulator and ready to mint moments.
### [TopShot Emulator Commands Reference](./EMULATOR.md)

1. Start the emulator
```bash
flow-c1 emulator start
```

2. Run the setup-flow.ps1 script. This will deploy contracts, setup a second emulator account(0x179b6b1cb6755e31) with a TopShot collection and create the sets.
```bash
./setup-flow.ps1
```

3. Create the plays. There are two modes, you can either create plays that do not have metadata or create plays with the exact metadata from Top Shot. Depends on your use case and creating all the metadata takes about 20 minutes compared to 4 minutes for the minimal metadata.

Create a python virtual environment
```bash
python -m venv venv
```

Activate the Virtual environment

```bash
.\venv\Scripts\activate
```

Verbose Mode: Same Play Metadata as TopShot 

```bash
python ./topshot/tools/create_plays.py
```

Empty Play Metadata

Minimal Mode: Minimal Play Metadata

```bash
python ./topshot/tools/create_plays_minimal.py
```

Add plays to sets. This is the exact mapping found on TopShot. Takes about 5 minutes. The script to generate the json that is used(play_metadata.json) is found in /topshot/tools/fetch_plays.py.
  
  ```bash
python ./topshot/tools/add_plays_to_sets.py
```

## TopShot Tiers

### Status

Under review/testing. Will deploy to mainnet soon.

### [Tiers Commands Reference](./TIERS.md)





