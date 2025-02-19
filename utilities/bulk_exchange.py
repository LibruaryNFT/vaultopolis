import subprocess
import json
import time
import argparse

# -----------------------------------------------------------------------------
# Default CONFIGURATION
# -----------------------------------------------------------------------------
DEFAULT_NETWORK = "mainnet"
DEFAULT_SIGNER = "mainnet-account4"
DEFAULT_CHILD_ADDRESS = "0x4ab8b294112f182c"

DEFAULT_GET_IDS_SCRIPT = "./topshot/scripts/get_collection_ids.cdc"
DEFAULT_EXCHANGE_TX = "./TSHOTExchange/transactions/exchangeNFTForTSHOT_child.cdc"

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

def get_child_nft_ids(child_address, network, script_path):
    """
    Calls the Cadence script to fetch all TopShot NFT IDs for 'child_address'.
    Returns a list of UInt64 NFT IDs.
    """
    print(f"Fetching NFT IDs for child account {child_address}...")
    cmd = [
        "flow", "scripts", "execute",
        script_path,
        child_address,
        f"--network={network}",
        "--output=json",
    ]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8"
        )
        output_json = json.loads(result.stdout)

        # The array is typically like:
        # {
        #   "type": "Array",
        #   "value": [
        #     { "type": "UInt64", "value": "12345" },
        #     ...
        #   ]
        # }
        array_items = output_json["value"]
        nft_ids = [int(item["value"]) for item in array_items]

        print(f"Found {len(nft_ids)} NFT IDs in child's collection.")
        return nft_ids

    except subprocess.CalledProcessError as e:
        print("Error fetching NFT IDs:", e.stderr)
        return []


def chunk_list(lst, size):
    """Split a list into consecutive sublists of a given maximum size."""
    for i in range(0, len(lst), size):
        yield lst[i:i + size]


def send_exchange_tx(child_address, nft_ids, network, signer, tx_path):
    """
    Sends the Cadence transaction to exchange the provided NFT IDs
    from the child account for TSHOT.
    
    Returns a tuple:
      (tx_id, tx_status)
      
    where tx_id is the transaction ID from the CLI response,
    and tx_status is the string or numeric status if provided.
    """
    # Convert the list of IDs into Flow argument format: [1,2,3]
    nft_ids_arg = f"[{','.join(str(i) for i in nft_ids)}]"
    cmd = [
        "flow", "transactions", "send",
        tx_path,
        child_address,
        nft_ids_arg,
        f"--network={network}",
        f"--signer={signer}",
        "--output", "json"
    ]

    print(f"\nExchanging {len(nft_ids)} NFTs for TSHOT...")
    print(f"Transaction command: {' '.join(cmd)}")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
            encoding="utf-8"
        )
        output_json = json.loads(result.stdout)

        # Flow CLI may use "transactionId" or "id"
        tx_id = output_json.get("transactionId") or output_json.get("id")

        # Some CLI versions provide a top-level "status" which could be "SEALED"
        # or a numeric code: 0..4. Let’s capture both.
        # e.g. "status": "SEALED" or "status": 4
        tx_status = output_json.get("status")

        print("Transaction Result (raw JSON):")
        print(result.stdout)

        # Return the ID and the "status" field (could be str or int or None)
        return (tx_id, tx_status)

    except subprocess.CalledProcessError as e:
        print("Error sending transaction:\n", e.stderr)
        return (None, None)


def wait_for_tx_sealed(tx_id, network, poll_interval=5, max_attempts=60):
    """
    Polls Flow for a transaction's status until it is SEALED (status=4)
    or we exceed max_attempts.
    """
    print(f"Waiting for TX {tx_id} to be sealed...")
    for attempt in range(1, max_attempts + 1):
        cmd = [
            "flow", "transactions", "status",
            tx_id,
            f"--network={network}",
            "--output=json"
        ]
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                encoding="utf-8"
            )
            status_json = json.loads(result.stdout)

            # The CLI might return:
            # {
            #   "status": 4,
            #   "statusString": "SEALED",
            #   ...
            # }
            status_code = status_json.get("status", -1)
            status_string = status_json.get("statusString", "")

            print(f"  [Attempt {attempt}] status_code={status_code}, statusString={status_string}")

            # Check numeric status
            if status_code == 4:
                print(f"Transaction {tx_id} is SEALED (via numeric status=4).")
                return

            # Fall back to statusString
            if status_string.upper() == "SEALED":
                print(f"Transaction {tx_id} is SEALED (via statusString).")
                return

        except subprocess.CalledProcessError as e:
            print("Error checking transaction status:\n", e.stderr)

        time.sleep(poll_interval)

    raise Exception(f"Transaction {tx_id} not sealed after {max_attempts} attempts.")


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Bulk exchange TopShot NFTs for TSHOT, waiting for each TX to seal."
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=40,
        help="Number of NFT IDs to include in each transaction (default: 40)."
    )
    parser.add_argument(
        "--max-batches",
        type=int,
        default=9999,
        help="Maximum number of batch transactions to send (default: 9999)."
    )
    parser.add_argument(
        "--child-address",
        type=str,
        default=DEFAULT_CHILD_ADDRESS,
        help=f"Child account address (default: {DEFAULT_CHILD_ADDRESS})."
    )
    parser.add_argument(
        "--network",
        type=str,
        default=DEFAULT_NETWORK,
        help=f"Flow network (default: {DEFAULT_NETWORK})."
    )
    parser.add_argument(
        "--signer",
        type=str,
        default=DEFAULT_SIGNER,
        help=f"Signer alias from flow.json (default: {DEFAULT_SIGNER})."
    )
    parser.add_argument(
        "--script-path",
        type=str,
        default=DEFAULT_GET_IDS_SCRIPT,
        help=f"Path to get_collection_ids.cdc (default: {DEFAULT_GET_IDS_SCRIPT})."
    )
    parser.add_argument(
        "--tx-path",
        type=str,
        default=DEFAULT_EXCHANGE_TX,
        help=f"Path to exchangeNFTForTSHOT_child.cdc (default: {DEFAULT_EXCHANGE_TX})."
    )
    parser.add_argument(
        "--poll-interval",
        type=int,
        default=5,
        help="Seconds to wait between status checks (default: 5)."
    )
    parser.add_argument(
        "--max-attempts",
        type=int,
        default=60,
        help="Maximum attempts to poll transaction status (default: 60)."
    )
    parser.add_argument(
        "--post-seal-delay",
        type=int,
        default=0,
        help="Extra delay (in seconds) after a TX is sealed (default: 0)."
    )

    args = parser.parse_args()

    # 1) Fetch all NFT IDs from child
    nft_ids = get_child_nft_ids(
        child_address=args.child_address,
        network=args.network,
        script_path=args.script_path
    )
    if not nft_ids:
        print("No NFTs found or an error occurred while fetching.")
        return

    # 2) Split into chunks
    chunks = list(chunk_list(nft_ids, args.chunk_size))
    total_chunks = len(chunks)
    print(f"\nTotal chunks needed = {total_chunks}")
    print(f"Will process up to {args.max_batches} batches if available.")

    # 3) Process each chunk
    for i, chunk in enumerate(chunks, start=1):
        if i > args.max_batches:
            print(f"Reached maximum number of batches ({args.max_batches}). Stopping.")
            break

        print(f"\n--- Processing chunk #{i} of size {len(chunk)} ---")
        tx_id, tx_status = send_exchange_tx(
            child_address=args.child_address,
            nft_ids=chunk,
            network=args.network,
            signer=args.signer,
            tx_path=args.tx_path
        )

        if not tx_id:
            print("Skipping wait_for_tx_sealed because no transaction ID was found.")
            continue

        # 4) Check if the CLI already gave us a "SEALED" status or code=4
        is_already_sealed = False
        # If status is an int and equals 4, it's sealed
        if isinstance(tx_status, int) and tx_status == 4:
            is_already_sealed = True
        # Or if it's a string "SEALED"
        elif isinstance(tx_status, str) and tx_status.upper() == "SEALED":
            is_already_sealed = True

        if is_already_sealed:
            print(f"Transaction {tx_id} is already sealed according to send command.")
        else:
            # Poll the transaction until sealed
            try:
                wait_for_tx_sealed(
                    tx_id=tx_id,
                    network=args.network,
                    poll_interval=args.poll_interval,
                    max_attempts=args.max_attempts
                )
            except Exception as e:
                print(f"ERROR: {e}")
                # Decide if you want to break or continue on error
                break

        # 5) Optional post-seal delay
        if args.post_seal_delay > 0:
            print(f"Waiting {args.post_seal_delay} seconds after sealing...")
            time.sleep(args.post_seal_delay)

    print("\nAll done exchanging NFTs for TSHOT.")


if __name__ == "__main__":
    main()
