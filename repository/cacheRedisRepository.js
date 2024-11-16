import { ENVNAME } from "../config/env.constant.js";
import { LOGGER } from "../config/winston-logger.config.js";
import { redisClient } from "../repository/baseRedisRepository.js";

const CACHE_NEW = {
  SCREENER_CACHE: "SCREENER_CACHE",
  PRE_MINUTES_READ: "PRE_MINUTES_READ",
  POST_MINUTES_READ: "POST_MINUTES_READ",
  PCR_TABLE: "PCR_TABLE",
  MAXPAIN_TABLE: "MAXPAIN_TABLE",
  PUTCALLRATIO: "PUTCALLRATIO",
  INTRADAY_OC: "INTRADAY_OC",
  INTRADAY_OC_1M: "INTRADAY_OC_1M",
  INTRADAY_OC_HISTORY: "INTRADAY_OC_HISTORY",
  IOC_HIST_DATES_AVLB: "IOC_HIST_DATES_AVLB",
  OPTION_CHAIN: "OPTION_CHAIN",
  OPTION_CHAIN_HISTORY: "OPTION_CHAIN_HISTORY",
  MAXPAIN: "MAXPAIN",
  STOCK_QUOTE: "STOCK_QUOTE",
  NEWS: "NEWS",
  TECHNICALS: "TECHNICALS",
  TICKERS: "TICKERS",
  INDICES: "INDICES",
  FOLivePrice: "FOLivePrice",
  NIFTY50: "NIFTY50",
  SYMBOL_EXPIRIES: "SYMBOL_EXPIRIES",
  TUES_EXPIRIES: "TUES_EXPIRIES",
  WED_EXPIRIES: "WED_EXPIRIES",
  BANKNIFTY_EXPIRIES: "BANKNIFTY_EXPIRIES",
  CURRENCY_EXPIRIES: "CURRENCY_EXPIRIES",
  THURS_EXPIRIES: "THURS_EXPIRIES",
};
Object.freeze(CACHE_NEW);

/**
 * Retrieves data from Redis cache or fetches and caches new data if not found.
 * @param {Function} asyncCallback - Async function that fetches data when cache is empty.
 * @param {string} featureName - Name of the feature or type of data being cached.
 * @param {string} cacheKey - Unique key to identify the cached data.
 * @param {number} [expirationSeconds=3600] - Expiration time in seconds (default: 1 hour).
 * @returns {Promise<any>} - Resolves with the cached or fetched data.
 */
async function getFromCache(
  asyncCallback,
  redisCacheKey,
  expirationSeconds = 3600,
) {
  let cacheResult = null;

  try {
    // const redisCacheKey = `${featureName}:${cacheKey}`;

    // Check if the result exists in Redis cache
    if (ENVNAME !== "dev") {
      cacheResult = await redisClient.get(redisCacheKey);
    }

    if (!cacheResult) {
      // Cache miss: Execute the asyncCallback to fetch the data
      cacheResult = await asyncCallback();

      // Store the result in Redis cache with the specified expiration time
      cacheResult &&
        (await redisClient.set(redisCacheKey, JSON.stringify(cacheResult), {
          EX: expirationSeconds,
        }));
    } else {
      // Cache hit: Parse the cached result from Redis
      cacheResult = JSON.parse(cacheResult);
    }
  } catch (error) {
    LOGGER.error(`Error accessing Redis cache for ${redisCacheKey}:  ${error}`);
    // In case of any error, fallback to executing the asyncCallback
    try {
      cacheResult = await asyncCallback();
    } catch (error) {
      LOGGER.error(`Error Redis Callback for ${redisCacheKey}:  ${error}`);
      LOGGER.debug(`${redisCacheKey} db not available`);
    }
  }

  return cacheResult;
}

async function cacheBreaker(redisCacheKey) {
  // const redisCacheKey = `${featureName}:${cacheKey}`;
  LOGGER.debug(`Breaking cache for ${redisCacheKey}`);

  try {
    // Delete the cached data from Redis
    await redisClient.del(redisCacheKey);
    LOGGER.debug(`Redis: ${redisCacheKey} cache successfully broken.`);
  } catch (error) {
    LOGGER.debug(
      `Redis: Error breaking Redis cache for ${redisCacheKey}:`,
      error,
    );
    LOGGER.error(
      `Redis: Error breaking Redis cache for ${redisCacheKey}:`,
      error,
    );
  }
}

/**
 * Breaks the cache for a specific feature and cacheKey, then fills new data into the cache.
 * @param {string} featureName - Name of the feature or type of data being cached.
 * @param {string} cacheKey - Unique key to identify the cached data.
 * @param {any} defaultValue - Default value or data to fill into the cache.
 */
async function cacheBreakAndFill(redisCacheKey, defaultValue) {
  LOGGER.debug(
    `Redis: Breaking Redis cache and filling data for ${redisCacheKey}`,
  );
  LOGGER.debug(defaultValue);

  try {
    // Break the cache (delete from Redis)
    await cacheBreaker(redisCacheKey);

    // If defaultValue is not empty, fetch new data and cache it
    if (defaultValue) {
      await getFromCache(() => defaultValue, redisCacheKey);
    }
  } catch (error) {
    LOGGER.debug(
      `Redis: Error breaking cache and filling data for ${redisCacheKey}:`,
      error,
    );
    LOGGER.error(
      `Redis: Error breaking cache and filling data for ${redisCacheKey}:`,
      error,
    );
  }
}

export { getFromCache, cacheBreaker, cacheBreakAndFill, CACHE_NEW };
