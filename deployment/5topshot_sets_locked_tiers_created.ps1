# Lock sets like mainnet
python .\tiers\tools\lock_sets.py

# Add default tiers for locked sets
python .\tiers\tools\add_default_tiers_locked_sets.py

# Add tiers for playids for non-locked sets
python .\tiers\tools\add_tiers_by_playid_open_sets.py

 # Get tier common
 flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 1

 #rare
 flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 301

 #legendary
 flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 302

 #common
 flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 4

 #legendary
 flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 5

 #common
 flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 6

 #ultimate
 flow scripts execute ./tiers/scripts/get_tier.cdc 0x179b6b1cb6755e31 7