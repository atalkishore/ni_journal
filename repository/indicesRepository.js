import { mongodb } from "./baseMongoDbRepository.js";
import { getFromCache, CACHE_NEW } from "./cacheRedisRepository.js";
import { LOGGER } from "../config/winston-logger.config.js";
import { capitalizeFirstLetterOfEachWord } from "../utils/helpers.js";

async function getStockQuotes() {
  let stock_quote = null;
  try {
    const _db = await mongodb;
    const collection = _db.collection("stock_quote");
    const query = { docType: "STOCK_QUOTE" };
    stock_quote = await collection.findOne(query);
    if (stock_quote?.data?.length > 0) {
      stock_quote?.data.forEach((doc) => {
        doc.name = capitalizeFirstLetterOfEachWord(doc.name);
        doc.symbolName = capitalizeFirstLetterOfEachWord(doc.symbolName);
      });
    }
  } catch (error) {
    LOGGER.error(`Error occurred popular symbols : ${error}`);
  }
  return stock_quote;
}
const getStockQuoteCache = async function () {
  return getFromCache(() => getStockQuotes(), CACHE_NEW.STOCK_QUOTE);
  //  getDocument('STOCK_QUOTE')
};

export const getStockQuote = getStockQuoteCache;
