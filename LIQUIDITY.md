SwapFactory
https://www.flowdiver.io/account/0xb063c16cac85dbd1
Pair creation and data container of all uni-v2 style (volatile) swap pair addresses

Summary of Key Contracts for Creating and Managing Your Liquidity Pool

1. SwapFactory Contract
   Purpose:
   The SwapFactory contract is used to create new liquidity pools (pairs) between two tokens.

Steps to Use:

Create the Liquidity Pool:
Call the createPair function on the SwapFactory contract.
Specify the vaults for $TSHOT and $stFlow.
This function will deploy a new SwapPair contract specific to the $TSHOT/$stFlow pair. 2. SwapPair Contract
Purpose:
The SwapPair contract manages the specific liquidity pool for your token pair. It handles adding/removing liquidity and processing swaps.

Steps to Use:

Add Initial Liquidity:
Once the pair is created, interact with the SwapPair contract.
Use the addLiquidity function to deposit your initial $2,500 worth of $TSHOT and $stFlow tokens into the pool.
Manage the Pool:
You can use the removeLiquidity function to withdraw liquidity.
The swap function allows tokens to be exchanged between $TSHOT and $stFlow within the pool.
How It Works:
Creation: SwapFactory creates a SwapPair contract for your chosen tokens.
Management: SwapPair handles the day-to-day operations of the liquidity pool, including liquidity management and swaps.
Note: You don’t need to interact with SwapRouter or SwapConfig directly; they are used internally to support advanced swap functionalities.

Increment.FI only allows for basic swap functionality, so you will primarily interact with the SwapPair contract to manage your liquidity pool.

Notes

Creating Pairing

flow transactions send ./swap/transactions/create_pair.cdc "TSHOT" 0x332ffc0ae9bba9c1 "FlowToken" 0x7e60df042a9c0868 false --network=testnet --signer=testnet-account

https://docs.increment.fi/protocols/decentralized-exchange/cpamm-dex/deployment-addresses

flow scripts execute .\swap\scripts\query_pair_info_by_tokenkey.cdc "A.332ffc0ae9bba9c1.TSHOT" "A.7e60df042a9c0868.FlowToken" false --network=testnet
