import json

# File paths
FULL_SET_PLAY_MAPPING_FILE = "set_play_mapping.json"
OPEN_SET_PLAY_TIER_MAPPING_FILE = "open_set_play_tier_mapping.json"

# Mixed tier mappings (manually defined)
TIER_MAPPINGS = {
    74: {
        2648: "legendary",
        2649: "legendary",
        2650: "rare",
        2651: "rare",
        2837: "legendary",
    },
    100: {
        3345: "legendary",
        3919: "legendary",
        4163: "rare",
        5301: "rare",
        5304: "legendary",
    },
    109: {
        3938: "legendary",
        4162: "rare",
        5299: "legendary",
        5300: "rare",
    },
    114: {
        4066: "legendary",
        4164: "rare",
        5302: "legendary",
        5303: "rare",
    },
    117: {
        4124: "rare",
        4125: "rare",
        4126: "legendary",
        4127: "rare",
        4128: "legendary",
        5305: "legendary",
        5306: "rare",
    },
    141: {play_id: "fandom" if play_id <= 5197 else "rare" for play_id in range(5149, 5198)},
    163: {play_id: "legendary" if play_id in [
        5739, 5656, 5660, 5662, 5669, 5673, 5682, 5741, 5742, 5744, 5745, 5749, 5740
    ] else "rare" for play_id in range(5655, 5751)},
    174: {play_id: "legendary" if play_id in [5872, 5873] else "rare" if play_id in [
        5872, 5873, 5874, 5875, 5877, 5878, 5884, 5885, 5887, 5890, 5893, 5899, 5901, 5904, 5907, 5910, 5879
    ] else "common" for play_id in range(5872, 5911)},
}

# Default tier mappings for non-mixed sets
DEFAULT_TIERS = {
    124: "common",
    125: "common",
    126: "common",
    127: "rare",
    128: "rare",
    129: "common",
    130: "rare",
    131: "legendary",
    132: "common",
    133: "common",
    134: "rare",
    135: "rare",
    136: "rare",
    137: "common",
    138: "fandom",
    139: "legendary",
    140: "ultimate",
    142: "rare",
    143: "fandom",
    144: "common",
    145: "common",
    146: "rare",
    147: "legendary",
    148: "rare",
    149: "rare",
    150: "rare",
    151: "ultimate",
    152: "rare",
    153: "legendary",
    154: "legendary",
    155: "common",
    156: "common",
    157: "rare",
    158: "common",
    159: "rare",
    160: "legendary",
    161: "legendary",
    162: "legendary",
    164: "common",
    165: "ultimate",
    166: "rare",
    167: "fandom",
    169: "legendary",
    170: "rare",
    171: "common",
    172: "rare",
    173: "rare",
}

def determine_tier(set_id, play_id):
    """Determine the tier for a play ID in a specific set."""
    if set_id in TIER_MAPPINGS and play_id in TIER_MAPPINGS[set_id]:
        return TIER_MAPPINGS[set_id][play_id]
    elif set_id in DEFAULT_TIERS:
        return DEFAULT_TIERS[set_id]
    else:
        return "common"  # Default tier if no specific mapping is provided


def main():
    # Load the full set-play mapping
    with open(FULL_SET_PLAY_MAPPING_FILE, "r") as f:
        full_set_play_mapping = json.load(f)

    # Get the open sets (assuming a function or logic to fetch open sets)
    open_sets = [74, 100, 109, 114, 117, 119, 124, 141, 163, 174] + list(range(124, 175))  # Example list of open sets

    open_set_play_tier_mapping = {}

    for set_id, play_ids in full_set_play_mapping.items():
        set_id = int(set_id)  # Ensure set ID is an integer
        if set_id in open_sets:
            # Add play IDs with tier information
            play_tier_mapping = {play_id: determine_tier(set_id, play_id) for play_id in play_ids}
            open_set_play_tier_mapping[set_id] = play_tier_mapping

    # Sort by set ID
    sorted_set_play_tier_mapping = dict(sorted(open_set_play_tier_mapping.items()))

    # Output the result as JSON
    with open(OPEN_SET_PLAY_TIER_MAPPING_FILE, "w") as f:
        json.dump(sorted_set_play_tier_mapping, f, indent=4)

    print(f"Open set play tier mapping saved to {OPEN_SET_PLAY_TIER_MAPPING_FILE}")


if __name__ == "__main__":
    main()
