import re
import requests
import csv
from collections import defaultdict

# --------------------------------------------------------------------------
# CONFIGURABLE PATHS & ENDPOINTS
# --------------------------------------------------------------------------
CADENCE_FILE_PATH = r"C:\Code\vaultopolis\tiers\transactions\bulk_add_playIDs.cdc"

# Endpoint returning JSON like:
# [
#   {
#     "setID": 166,
#     "defaultTier": "None",
#     "playTiers": [
#        {"playID": 5984, "tier": "rare"},
#        {"playID": 6291, "tier": "rare"},
#        ...
#      ]
#   },
#   {
#     "setID": 174,
#     "defaultTier": "None",
#     "playTiers": [
#        {"playID": 6040, "tier": "rare"},
#        ...
#      ]
#   },
#   ...
# ]
TOPSHOT_TIERS_ENDPOINT = "https://api.vaultopolis.com/topshot-tiers"

# Endpoint returning JSON like:
# [
#   {
#     "_id": "...",
#     "setID": 166,
#     "playID": 5984,
#     "momentCount": 999,
#     ...
#   },
#   ...
# ]
TOPSHOT_DATA_ENDPOINT = "https://api.vaultopolis.com/topshot-data"

OUTPUT_CSV = "tier_checks_report.csv"


# --------------------------------------------------------------------------
# STEP A: PARSE THE CADENCE TRANSACTION FILE
# --------------------------------------------------------------------------
def parse_cadence_file(file_path):
    """
    Parses the Cadence .cdc file to find lines calling:
      self.adminRef.addOrUpdatePlayIDTier(setID: X, playID: Y, tier: TopShotTiers.Tier.Z)
    Returns a list of dicts:
      [
        { "setID": int, "playID": int, "script_tier": str },
        ...
      ]
    """
    pattern = r"addOrUpdatePlayIDTier\(setID:\s*(\d+),\s*playID:\s*(\d+),\s*tier:\s*TopShotTiers\.Tier\.(\w+)\)"
    results = []

    with open(file_path, "r", encoding="utf-8") as f:
        contents = f.read()

    matches = re.findall(pattern, contents)
    for match in matches:
        set_id = int(match[0])
        play_id = int(match[1])
        tier_str = match[2]  # e.g., "common", "rare", "legendary", etc.
        results.append({
            "setID": set_id,
            "playID": play_id,
            "script_tier": tier_str
        })
    return results


# --------------------------------------------------------------------------
# STEP B: FETCH AND MERGE DATA FROM BOTH ENDPOINTS
# --------------------------------------------------------------------------
def fetch_and_merge_data():
    """
    1) Fetch from /topshot-tiers:
       [
         {
           "setID": ...,
           "defaultTier": "None" or "rare"/"common"/...,
           "playTiers": [
             {"playID": X, "tier": "rare", "momentCount": ???},
             ...
           ]
         },
         ...
       ]
       We'll store:
         api_lookup[(setID, playID)] = {
            "defaultTier": <from set-level>,
            "api_tier": <from playTiers>,
            "momentCount": <maybe from playTiers if it exists; else None>
         }
         unique_tiers_from_API[setID] = set of all tier values we find (including defaultTier if not "None").

    2) Fetch from /topshot-data (which has "momentCount" for each (setID, playID)):
       [
         {
           "setID": X,
           "playID": Y,
           "momentCount": 999,
           ...
         },
         ...
       ]
       We'll update api_lookup to ensure "momentCount" is filled in if found.

    Returns:
      api_lookup         (dict[(setID, playID)] -> {defaultTier, api_tier, momentCount})
      unique_tiers_from_API (dict[setID] -> set of tiers)
    """
    # 1) Get topShotTiers data
    resp_tiers = requests.get(TOPSHOT_TIERS_ENDPOINT)
    resp_tiers.raise_for_status()
    topShotTiers_data = resp_tiers.json()

    api_lookup = {}
    unique_tiers_from_API = defaultdict(set)

    for set_obj in topShotTiers_data:
        set_id = set_obj.get("setID")
        default_tier = set_obj.get("defaultTier", "None")

        # If default_tier isn't "None" (or if you want to store literally "None" too), you can decide.
        if default_tier and default_tier != "None":
            unique_tiers_from_API[set_id].add(default_tier)

        play_tiers = set_obj.get("playTiers", [])
        for p in play_tiers:
            play_id = p.get("playID")
            p_tier = p.get("tier", "None")         # e.g. "rare", "common", or "None"
            p_mc   = p.get("momentCount", None)    # might exist or not in topShotTiers

            # Add p_tier to the set-level unique tiers if it's not "None"
            if p_tier != "None":
                unique_tiers_from_API[set_id].add(p_tier)

            # Build partial record
            api_lookup[(set_id, play_id)] = {
                "defaultTier": default_tier,   # store the set's default tier
                "api_tier": p_tier,           # store the per-play tier
                "momentCount": p_mc           # maybe None if not provided
            }

    # 2) Now fetch topShotData for the momentCount
    resp_data = requests.get(TOPSHOT_DATA_ENDPOINT)
    resp_data.raise_for_status()
    topShotData_data = resp_data.json()  # a list of dicts

    for item in topShotData_data:
        set_id = item.get("setID")
        play_id = item.get("playID")
        mc = item.get("momentCount", None)

        # If we already have an entry in api_lookup, just update the momentCount
        if (set_id, play_id) in api_lookup:
            api_lookup[(set_id, play_id)]["momentCount"] = mc
        else:
            # We don't have an entry from /topshot-tiers for this pair
            # We'll create one so we can track momentCount at least
            # The defaultTier/api_tier are unknown
            unique_tiers_from_API[set_id]  # ensure the key is created
            api_lookup[(set_id, play_id)] = {
                "defaultTier": "None",
                "api_tier": "None",
                "momentCount": mc
            }

    return api_lookup, unique_tiers_from_API


# --------------------------------------------------------------------------
# TIER LOGIC: DETERMINE ALL "QA_possible_tiers" FROM momentCount
# --------------------------------------------------------------------------
def get_qa_possible_tiers(moment_count):
    """
    Return all possible tiers (as a sorted list) based on your numeric thresholds:
      - Always includes "fandom" (since it can be any).
      - If <= 20, add "ultimate", "legendary", "rare".
      - Else if < 100, add "legendary", "rare".
      - Else if < 1000, add "rare".
      - If >= 2500, add "common".

    That leaves a gap from 1000..2499 => only "fandom".
    If momentCount is None, we can't do numeric-based checks, so just "fandom".
    """
    if moment_count is None:
        return ["fandom"]

    results = {"fandom"}  # always fandom
    if moment_count <= 20:
        results.update(["ultimate", "legendary", "rare"])
    elif moment_count < 100:
        results.update(["legendary", "rare"])
    elif moment_count < 1000:
        results.add("rare")

    if moment_count >= 2500:
        results.add("common")

    return sorted(results)


# --------------------------------------------------------------------------
# STEP C & D: RUN CHECKS AND GENERATE REPORT ENTRIES
# --------------------------------------------------------------------------
def run_checks(parsed_data, api_lookup, unique_tiers_dict):
    """
    For each (setID, playID, script_tier) from the .cdc file:
      - Lookup in api_lookup. If not found, flag "NOT FOUND IN API".
      - Otherwise, gather:
          defaultTier
          api_tier
          momentCount
        Build QA_possible_tiers from momentCount.
      - If momentCount == 0, add a warning that we shouldn't assign a tier.
      - Check if script_tier is in QA_possible_tiers. If not, warn.
      - If duplicates in the .cdc, warn.
      - Gather unique_tiers_from_API for that setID.
    Returns list of rows for the final CSV.
    """

    # Detect duplicates in the script
    count_map = defaultdict(int)
    for entry in parsed_data:
        key = (entry["setID"], entry["playID"])
        count_map[key] += 1

    results = []
    for entry in parsed_data:
        set_id = entry["setID"]
        play_id = entry["playID"]
        script_tier = entry["script_tier"]

        duplicates = count_map[(set_id, play_id)]
        warnings = []

        # Lookup in merged data
        record = api_lookup.get((set_id, play_id))
        if not record:
            # Not found in either endpoint
            row = {
                "setID": set_id,
                "playID": play_id,
                "script_tier": script_tier,
                "defaultTier_from_API": "N/A",
                "unique_tiers_from_API": "",
                "momentCount": "",
                "QA_possible_tiers": "",
                "warnings": "NOT FOUND IN API"
            }
            results.append(row)
            continue

        default_tier = record.get("defaultTier", "None")
        api_tier = record.get("api_tier", "None")
        moment_count = record.get("momentCount", None)

        # If momentCount == 0, warn that we shouldn't assign a tier to this play
        if moment_count == 0:
            warnings.append("momentCount=0 => NO tier assignment permitted!")

        # Build QA_possible_tiers
        possible_list = get_qa_possible_tiers(moment_count)

        # Get the set-level unique tiers
        set_unique_list = sorted(unique_tiers_dict.get(set_id, set()))

        # Check if script_tier is in QA_possible_tiers
        # (only if moment_count != 0; if moment_count==0, this is automatically a warning.)
        if moment_count != 0 and script_tier not in possible_list:
            warnings.append(
                f"script_tier={script_tier} not in QA_possible_tiers={possible_list} (mCount={moment_count})"
            )

        # Check duplicates
        if duplicates > 1:
            warnings.append(f"Duplicate in script (appears {duplicates} times)")

        row = {
            "setID": set_id,
            "playID": play_id,
            "script_tier": script_tier,
            "defaultTier_from_API": default_tier,
            "unique_tiers_from_API": ", ".join(set_unique_list),
            "momentCount": str(moment_count) if moment_count is not None else "",
            "QA_possible_tiers": ", ".join(possible_list),
            "warnings": "; ".join(warnings)
        }
        results.append(row)

    return results


def generate_csv_report(rows, csv_path):
    """
    Writes the result rows to a CSV file. Column order:
      setID, playID, script_tier,
      defaultTier_from_API, unique_tiers_from_API,
      momentCount, QA_possible_tiers,
      warnings
    """
    fieldnames = [
        "setID",
        "playID",
        "script_tier",
        "defaultTier_from_API",
        "unique_tiers_from_API",
        "momentCount",
        "QA_possible_tiers",
        "warnings"
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def main():
    # Parse the transaction file
    parsed_data = parse_cadence_file(CADENCE_FILE_PATH)
    print(f"Parsed {len(parsed_data)} lines from {CADENCE_FILE_PATH}.")

    # Fetch & merge data from /topshot-tiers and /topshot-data
    api_lookup, unique_tiers_dict = fetch_and_merge_data()
    print(f"Merged API data: {len(api_lookup)} (setID,playID) records found in total.")

    # Run QA checks
    results = run_checks(parsed_data, api_lookup, unique_tiers_dict)
    print(f"Completed QA checks on {len(results)} script entries.")

    # Generate CSV report
    generate_csv_report(results, OUTPUT_CSV)
    print(f"Report saved to {OUTPUT_CSV}.")


if __name__ == "__main__":
    main()
