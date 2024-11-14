const { mongodb } = require('./baseMongoDbRepository');
const { getStockQuote } = require("./indicesRepository");
const { capitalizeFirstLetterOfEachWord } = require("../utils/helpers");
const { getSecondsRemainingBeforeMidnightIST } = require("../utils/dateUtils");
const { getFromCache, CACHE_NEW } = require("./cacheRedisRepository");
const { LOGGER } = require('../config/winston-logger.config');


let getTickersV2 = async function () {
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
        const collection = _db.collection('option_ticker');
        const query = { active_status: true, manually_deactivated: { $ne: true } };

        cursor = await collection.find(query);

        data = (await cursor.toArray())
        data?.sort(compare);
        // data = dataArr?.map(doc => ({ expiryDate: doc.expiry?.toUpperCase() }))?.sort((a, b) => +new Date(a.expiryDate) - +new Date(b.expiryDate));
        // console.log(data);

    } catch (error) {
        LOGGER.error(`Error occurred Option Ticker : ${error}`);
    }
    if (data.length > 0) {
        try {
            const _db = await mongodb;
            const collection = _db.collection('configuration');
            const query = { key: 'popular_symbols' };
            let popularSymbols = await collection.findOne(query);
            // popularSymbols = (await cursor.toArray())

            data.forEach(doc => {
                if (doc?.ticker?.name) {
                    doc.ticker.name = capitalizeFirstLetterOfEachWord(doc.ticker.name);
                }
                doc.isPopularCategory = popularSymbols?.symbols?.includes(doc?.ticker.symbol) ?? false;

            });
        } catch (error) {
            LOGGER.error(`Error occurred popular symbols : ${error}`);
        }
    }
    return data;
};
let tickerCache = async function () {
    let EX = getSecondsRemainingBeforeMidnightIST()
    return getFromCache(() => getTickersV2(), CACHE_NEW.TICKERS, EX);
};


let liveStockPriceV3 = async function (symbol) {
    let data = null;
    let defaultData = {
        "type": "equity",
        "symbol": symbol,
        "symbolName": "",
        "name": "",
        "ltp": 0,
        "change": 0,
        "pchange": 0,
        "dayHigh": 0,
        "dayLow": 0,
    };
    try {

        let stockQuote = await getStockQuote();
        data = stockQuote
            .data
            .find(it => it.symbol === symbol) ?? defaultData;

    } catch (e) {
        data = defaultData
    }

    return data;
}

module.exports.getTickers = tickerCache;
module.exports.getLiveStockPrice = liveStockPriceV3;

