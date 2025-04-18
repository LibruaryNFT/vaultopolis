import requests
from collections import defaultdict
import os

API_URL = "https://api.vaultopolis.com/topshot-data"
OUTPUT_FILE = "tiers/transactions/bulk_add_playids.cdc"

def get_qa_possible_tiers(moment_count):
    """
    Same logic from your QA script:
      - Always includes "fandom" (since it can be any).
      - If <= 20, add "ultimate", "legendary", "rare".
      - Else if < 100, add "legendary", "rare".
      - Else if < 1000, add "rare".
      - If >= 2500, add "common".
      - If moment_count is None, return ["fandom"] only.
    """
    if moment_count is None:
        return ["fandom"]

    results = {"fandom"}  # always includes fandom
    if moment_count <= 20:
        results.update(["ultimate", "legendary", "rare"])
    elif moment_count < 100:
        results.update(["legendary", "rare"])
    elif moment_count < 1000:
        results.add("rare")

    if moment_count >= 2500:
        results.add("common")

    return sorted(results)

def main():
    # 1. Fetch the data
    response = requests.get(API_URL)
    response.raise_for_status()
    data = response.json()

    # 2. Filter for those with tier == None
    null_tier_editions = [item for item in data if item.get("tier") is None]

    # 3. Group by setID
    grouped_by_set = defaultdict(list)
    for edition in null_tier_editions:
        set_id = edition["setID"]
        grouped_by_set[set_id].append(edition)

    # 4. Sort each group by playID
    for set_id in grouped_by_set:
        grouped_by_set[set_id].sort(key=lambda x: x["playID"])

    # 5. Build the Cadence transaction
    transaction_lines = []
    transaction_lines.append('import TopShotTiers from 0xb1788d64d512026d\n')
    transaction_lines.append('transaction {')
    transaction_lines.append('    let adminRef: &TopShotTiers.Admin\n')
    transaction_lines.append('    prepare(signer: auth(Storage) &Account) {')
    transaction_lines.append('        self.adminRef = signer.storage')
    transaction_lines.append('            .borrow<&TopShotTiers.Admin>(from: /storage/TopShotTiersAdmin)')
    transaction_lines.append('            ?? panic("Could not borrow a reference to the Admin resource")')
    transaction_lines.append('    }')
    transaction_lines.append('')
    transaction_lines.append('    execute {')

    # For each setID in ascending order
    for set_id in sorted(grouped_by_set.keys()):
        editions_in_set = grouped_by_set[set_id]
        if not editions_in_set:
            continue

        # The 'name' from the first item in this set
        set_name = editions_in_set[0].get("name", "UnknownSetName")

        transaction_lines.append(f'        // --------------------------------------')
        transaction_lines.append(f'        // Set {set_id} - "{set_name}"')
        transaction_lines.append(f'        // --------------------------------------')

        for edition in editions_in_set:
            play_id = edition.get("playID", "???")
            full_name = edition.get("FullName", "UnknownPlayer")
            moment_count = edition.get("momentCount", None)

            # subeditions
            subeditions = edition.get("subeditions", [])
            sub_ids = [str(sub.get("subeditionID", "")) for sub in subeditions]
            sub_ids_str = ", ".join(sub_ids) if sub_ids else "None"

            # Determine possible tiers
            possible_tiers = get_qa_possible_tiers(moment_count)
            possible_tiers_str = ", ".join(possible_tiers)

            # Build the comment line
            comment_line = (
                f'        // PlayerName: {full_name}, '
                f'setName: {set_name}, '
                f'momentCount: {moment_count}, '
                f'subeditionIDs: [{sub_ids_str}], '
                f'possibleTiers: [{possible_tiers_str}]'
            )
            transaction_lines.append(comment_line)

            # The actual addOrUpdate call
            call_line = (
                f'        self.adminRef.addOrUpdatePlayIDTier('
                f'setID: {set_id}, playID: {play_id}, tier: TopShotTiers.Tier.null)'
            )
            transaction_lines.append(call_line)
            transaction_lines.append('')

    transaction_lines.append('    }')
    transaction_lines.append('}')

    # 6. Make sure the output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    # 7. Write out to the file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(transaction_lines))

    print(f"Done! Created {OUTPUT_FILE} with {len(null_tier_editions)} entries.")

if __name__ == "__main__":
    main()
