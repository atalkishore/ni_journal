const { getFromCache, CACHE_NEW } = require("./cacheRedisRepository");
const { capitalizeFirstLetterOfEachWord } = require("../utils/helpers");
const { LOGGER } = require('../config/winston-logger.config');
const { mongodb } = require('./baseMongoDbRepository');


async function getStockQuotes() {
    let stock_quote = null;
    try {
        const _db = await mongodb;
        const collection = _db.collection('stock_quote');
        const query = { docType: 'STOCK_QUOTE' };
        stock_quote = await collection.findOne(query);
        if (stock_quote?.data?.length > 0) {
            stock_quote?.data.forEach(doc => {
                doc.name = capitalizeFirstLetterOfEachWord(doc.name);
                doc.symbolName = capitalizeFirstLetterOfEachWord(doc.symbolName);
            })
        }
    } catch (error) {
        LOGGER.error(`Error occurred popular symbols : ${error}`);
    }
    return stock_quote;
}
let getStockQuoteCache = async function () {
    return getFromCache(() => getStockQuotes(), CACHE_NEW.STOCK_QUOTE);
    //  getDocument('STOCK_QUOTE')
};


let getNifty = function () {
    return getFromCache(() => getDocument('NIFTY50'), CACHE_NEW.NIFTY50);

};



module.exports.getNifty = getNifty;
module.exports.getStockQuote = getStockQuoteCache;

