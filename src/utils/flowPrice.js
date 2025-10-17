import * as fcl from "@onflow/fcl";

// FLOW price fetching utility
const FLOW_PRICE_SCRIPT = `
import PublicPriceOracle from 0xec67451f8a58216a

// Fetches current FLOW/USD price from Flow's decentralized price oracle
// Returns: UFix64? - Current FLOW price in USD, nil if unavailable

access(all) fun main(): UFix64? {
    let flowOracleAddress: Address = 0xe385412159992e11  // FLOW/USD oracle address
    
    let price = PublicPriceOracle.getLatestPrice(oracleAddr: flowOracleAddress)
    return price
}
`;

let cachedPrice = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Fetches the current FLOW/USD price from the Flow oracle
 * @returns {Promise<number|null>} Current FLOW price in USD, or null if unavailable
 */
export async function getFlowPrice() {
  const now = Date.now();
  
  // Return cached price if still valid
  if (cachedPrice && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPrice;
  }
  
  try {
    const price = await fcl.query({
      cadence: FLOW_PRICE_SCRIPT,
    });
    
    if (price !== null && price !== undefined) {
      cachedPrice = parseFloat(price);
      lastFetchTime = now;
      return cachedPrice;
    }
  } catch (error) {
    console.warn('Failed to fetch FLOW price:', error);
  }
  
  return null;
}

/**
 * Converts FLOW amount to USD using current price
 * @param {number} flowAmount - Amount in FLOW
 * @returns {Promise<number|null>} USD amount, or null if price unavailable
 */
export async function convertFlowToUSD(flowAmount) {
  const price = await getFlowPrice();
  if (price === null) return null;
  
  return flowAmount * price;
}

/**
 * Synchronously converts FLOW amount to USD using cached price
 * @param {number} flowAmount - FLOW amount to convert
 * @returns {number|null} USD amount, or null if no cached price available
 */
export function convertFlowToUSDSync(flowAmount) {
  if (cachedPrice === null || typeof cachedPrice !== 'number' || typeof flowAmount !== 'number') return null;
  const result = flowAmount * cachedPrice;
  return typeof result === 'number' && !isNaN(result) ? result : null;
}

/**
 * Formats USD amount for display
 * @param {number} usdAmount - USD amount
 * @returns {string} Formatted USD string (e.g., "$1.23")
 */
export function formatUSD(usdAmount) {
  if (usdAmount === null || usdAmount === undefined || typeof usdAmount !== 'number') return '';
  return `$${usdAmount.toFixed(2)}`;
}


