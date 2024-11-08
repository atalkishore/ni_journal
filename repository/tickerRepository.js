const firebase = require("firebase-admin");
const { mongodb } = require('./baseMongoDbRepository');
const { getIndices } = require("./indicesRepository");
const { getFOLivePrice, getStockQuote } = require("./indicesRepository");
const { capitalizeFirstLetterOfEachWord } = require("../utils/helpers");
const { getSecondsRemainingBeforeMidnightIST } = require("../utils/dateUtils");
const { getFromCache, CACHE_NEW } = require("./cacheRedisRepository");
const { LOGGER } = require('../config/winston-logger.config');

let getTickers = function () {
    function compare(a, b) {
        if (a.ticker.symbol < b.ticker.symbol) {
            return -1;
        }
        if (a.ticker.symbol > b.ticker.symbol) {
            return 1;
        }
        return 0;
    }

    return firebase
        .firestore()
        .collection('GLOBAL')
        .doc('OPTION_TICKER')
        .get()
        .then(function (querySnapshot) {
            let tickers = querySnapshot.data().ticker;
            tickers.push({
                ticker: {
                    symbol: "SENSEX",
                    name: "SENSEX",
                },
                lotSize: 10,
                instrument: "OPTIDX",
            })
            tickers.sort(compare);
            return tickers;
        })
        .catch((err) => {
            LOGGER.error(`Error occurred fetching ticker: ${err}`);
            console.log('Error getting documents', err);
        });
};
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


let liveStockPriceV2 = async function (symbol) {
    let data = null;
    let defaultData = {
        "type": "equity",
        "symbol": symbol,
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

