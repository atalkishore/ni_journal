import { mongodb } from './baseMongoDbRepository.js';
import { getFromCache, CACHE_NEW } from './cacheRedisRepository.js';
import { LOGGER } from '../config/winston-logger.config.js';
import { getSecondsRemainingBeforeMidnightIST } from '../utils/dateUtils.js';
import { isDateGreaterThanOrEqualToTodayInIST } from '../utils/helpers.js';

function isMarketOpenFor(symbol) {
  const marketTimings = {
    NIFTY: { open: 540, close: 930 },
    FINNIFTY: { open: 540, close: 930 },
    MIDCPNIFTY: { open: 540, close: 930 },
    BANKNIFTY: { open: 540, close: 930 },
    SENSEX: { open: 540, close: 930 },
    BANKEX: { open: 540, close: 930 },
    USDINR: { open: 540, close: 1020 },
  };

  const now = new Date();
  const timeInMinutes = now.getUTCHours() * 60 + now.getUTCMinutes() + 330;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;
  const specialOpenDate =
    now.getUTCFullYear() === 2024 &&
    now.getUTCMonth() === 4 &&
    now.getUTCDate() === 18;

  if (marketTimings[symbol] && (!isWeekend || specialOpenDate)) {
    const { open, close } = marketTimings[symbol];
    return timeInMinutes >= open && timeInMinutes < close;
  }

  return false;
}

async function getSymbolExpiryFor(symbol) {
  let data = null;
  try {
    const _db = await mongodb;
    const collection = _db.collection('expiry');
    const query = {
      symbol: symbol,
      manually_deactivated: { $ne: true },
      active_status: true,
    };
    const cursor = await collection.find(query);
    const dataArr = await cursor.toArray();
    data = dataArr
      ?.map((doc) => ({ expiryDate: doc.expiry?.toUpperCase() }))
      ?.sort((a, b) => +new Date(a.expiryDate) - +new Date(b.expiryDate));
    // console.log(data);
  } catch (error) {
    LOGGER.error(`Error occurred maxpainv2 ${symbol} : ${error}`);
  }
  return data;
}

const getSymbolExpiryForCache = async function (symbol) {
  const Ex = getSecondsRemainingBeforeMidnightIST();
  return getFromCache(
    () => getSymbolExpiryFor(symbol),
    `${CACHE_NEW.SYMBOL_EXPIRIES}:${symbol}`,
    Ex
  );
};

async function processExpiryServiceV2(
  symbol,
  expiryParam,
  expiryCount = 8,
  includePrevValue = 0
) {
  let expiryArr = await getSymbolExpiryForCache(symbol);

  let closetMonthIndex = expiryArr.findIndex((it) =>
    isDateGreaterThanOrEqualToTodayInIST(it.expiryDate)
  );

  const closetExpiryMonth = expiryArr[closetMonthIndex]?.expiryDate;

  closetMonthIndex = Math.max(closetMonthIndex - includePrevValue, 0);

  const endIndex = closetMonthIndex + Math.min(expiryArr.length, expiryCount);
  expiryArr = expiryArr
    .slice(closetMonthIndex, endIndex)
    // .slice(closetMonthIndex, expiryArr.length)
    .map((it) => it.expiryDate);

  let expiry = expiryArr.find((it) => it === expiryParam);
  expiry =
    expiry || expiryArr[Math.min(includePrevValue, expiryArr.length - 1)];
  return { expiryArr, expiry, closetExpiryMonth };
}

export { isMarketOpenFor, processExpiryServiceV2 as processExpiryService };
