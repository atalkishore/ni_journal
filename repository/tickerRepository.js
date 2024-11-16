import { mongodb } from "./baseMongoDbRepository.js";
import { getFromCache, CACHE_NEW } from "./cacheRedisRepository.js";
import { getStockQuote } from "./indicesRepository.js";
import { LOGGER } from "../config/winston-logger.config.js";
import { getSecondsRemainingBeforeMidnightIST } from "../utils/dateUtils.js";
import { capitalizeFirstLetterOfEachWord } from "../utils/helpers.js";

const getTickersV2 = async function () {
  function compare(a, b) {
    if (a.ticker.symbol < b.ticker.symbol) {
      return -1;
    }
    if (a.ticker.symbol > b.ticker.symbol) {
      return 1;
    }
    return 0;
  }
  let data = null;
  try {
    const _db = await mongodb;
    const collection = _db.collection("option_ticker");
    const query = { active_status: true, manually_deactivated: { $ne: true } };

    const cursor = await collection.find(query);

    data = await cursor.toArray();
    data?.sort(compare);
    // data = dataArr?.map(doc => ({ expiryDate: doc.expiry?.toUpperCase() }))?.sort((a, b) => +new Date(a.expiryDate) - +new Date(b.expiryDate));
    // console.log(data);
  } catch (error) {
    LOGGER.error(`Error occurred Option Ticker : ${error}`);
  }
  if (data.length > 0) {
    try {
      const _db = await mongodb;
      const collection = _db.collection("configuration");
      const query = { key: "popular_symbols" };
      const popularSymbols = await collection.findOne(query);
      // popularSymbols = (await cursor.toArray())

      data.forEach((doc) => {
        if (doc?.ticker?.name) {
          doc.ticker.name = capitalizeFirstLetterOfEachWord(doc.ticker.name);
        }
        doc.isPopularCategory =
          popularSymbols?.symbols?.includes(doc?.ticker.symbol) ?? false;
      });
    } catch (error) {
      LOGGER.error(`Error occurred popular symbols : ${error}`);
    }
  }
  return data;
};
const tickerCache = async function () {
  const EX = getSecondsRemainingBeforeMidnightIST();
  return getFromCache(() => getTickersV2(), CACHE_NEW.TICKERS, EX);
};

const liveStockPriceV3 = async function (symbol) {
  let data = null;
  const defaultData = {
    type: "equity",
    symbol: symbol,
    symbolName: "",
    name: "",
    ltp: 0,
    change: 0,
    pchange: 0,
    dayHigh: 0,
    dayLow: 0,
  };
  try {
    const stockQuote = await getStockQuote();
    data = stockQuote.data.find((it) => it.symbol === symbol) ?? defaultData;
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    data = defaultData;
  }

  return data;
};

export const getTickers = tickerCache;
export const getLiveStockPrice = liveStockPriceV3;
