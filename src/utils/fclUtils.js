// src/utils/fclUtils.js
import * as fcl from "@onflow/fcl";

/**
 * Executes an FCL query with retry logic and exponential backoff.
 * @param {object} queryConfig - The FCL query configuration object.
 * @param {string} queryConfig.cadence - The Cadence code.
 * @param {function} [queryConfig.args] - The argument function for the query.
 * @param {object} [queryConfig.authz] - Authorization function or object.
 * @param {number} [queryConfig.limit] - The compute limit for the query.
 * @param {number} [retries=3] - Maximum number of retries.
 * @param {number} [initialDelay=1000] - Initial delay in ms for backoff.
 * @returns {Promise<any>} A promise that resolves with the query result.
 * @throws {Error} Throws the last error if all retries fail.
 */
export async function fclQueryWithRetry(
  queryConfig,
  retries = 3,
  initialDelay = 1000
) {
  let attempt = 0;
  let currentIterationDelay = initialDelay; // Renamed to avoid confusion with outer scope if any

  while (attempt <= retries) {
    try {
      // console.log(`[fclQueryWithRetry] Attempt ${attempt + 1} for query...`);
      return await fcl.query(queryConfig);
    } catch (error) {
      attempt++;
      const isLastAttempt = attempt > retries;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.warn(
        `[fclQueryWithRetry] Attempt ${attempt} failed for query. Error: ${errorMessage}. Retries left: ${
          retries - attempt + 1
        }`
      );

      if (isLastAttempt) {
        console.error(
          `[fclQueryWithRetry] All ${
            retries + 1
          } attempts failed. Last error: ${errorMessage}`
        );
        throw error; // Re-throw the last error
      }

      // Exponential backoff
      // Capture the delay for this specific timeout to make it clear to linters
      const delayForThisTimeout = currentIterationDelay;
      await new Promise((resolve) => setTimeout(resolve, delayForThisTimeout));

      currentIterationDelay *= 2; // Double the delay for the next attempt
    }
  }
  // This line should ideally not be reached due to the throw in the loop,
  // but as a fallback:
  throw new Error("[fclQueryWithRetry] Max retries reached without success.");
}

// Example Usage (commented out - for illustration):
/*
async function exampleFetch() {
  try {
    const cadence = `
      pub fun main(addr: Address): Bool {
        return getAccount(addr) != nil
      }
    `;
    const args = (arg, t) => [arg("0xSOMEADDRESS", t.Address)];
    const result = await fclQueryWithRetry({ cadence, args });
    console.log("Query result:", result);
  } catch (e) {
    console.error("Example fetch failed:", e);
  }
}
*/
