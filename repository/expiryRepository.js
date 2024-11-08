const firebase = require("firebase-admin");
const { getSecondsRemainingBeforeMidnightIST } = require("../utils/dateUtils");
const { yesterday, isDateGreaterThanOrEqualToTodayInIST, isIndexSymbol } = require("../utils/helpers");
const { getFromCache, CACHE_NEW } = require("./cacheRedisRepository");
const { getDocumentData } = require("./baseRepository");
const { mongodb } = require('./baseMongoDbRepository');
const { LOGGER } = require('../config/winston-logger.config');

let expiryCache = async function () {
    return getFromCache(() => getAllExpiry(), CACHE_NEW.THURS_EXPIRIES, 86400);
};
let tuesExpiryCache = async function () {
    return getFromCache(() => getAllTuesExpiry(), CACHE_NEW.TUES_EXPIRIES, 86400);
};

let wedExpiryCache = async function () {
    return getFromCache(() => getAllWedExpiry(), CACHE_NEW.WED_EXPIRIES, 86400);
};

let BankNiftyExpiryCache = async function () {
    return getFromCache(() => getBankNiftyExpiry(), CACHE_NEW.BANKNIFTY_EXPIRIES, 86400);
};

let currencyExpiryCache = async function () {
    return getFromCache(() => getCurrencyExpiry(), CACHE_NEW.CURRENCY_EXPIRIES, 86400);
};

let getAllExpiry = function () {
    return firebase
        .firestore()
        .collection('GLOBAL')
        .doc('EXPIRY')
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.exists) {
                let documentData = querySnapshot.data();
                return documentData.data
                    .map((it) => {
                        const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
                        let expiryDate = new Date(it.expiryDate);
                        expiryDate = ('0' + expiryDate.getDate()).slice(-2) + '' + formatter.format(expiryDate).toUpperCase() + '' + expiryDate.getFullYear();
                        return { expiryDate: expiryDate, monthlyExpiry: it.monthlyExpiry }
                    })
            }
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error)
        })
};

let getAllTuesExpiry = function () {
    return firebase
        .firestore()
        .collection('GLOBAL')
        .doc('EXPIRY_TUES')
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.exists) {
                let documentData = querySnapshot.data();
                return documentData.data
                    .map((it) => {
                        const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
                        let expiryDate = new Date(it.expiryDate);
                        expiryDate = ('0' + expiryDate.getDate()).slice(-2) + '' + formatter.format(expiryDate).toUpperCase() + '' + expiryDate.getFullYear();
                        return { expiryDate: expiryDate, monthlyExpiry: it.monthlyExpiry }
                    })
            }
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error)
        })
};

let getAllWedExpiry = function () {
    return firebase
        .firestore()
        .collection('GLOBAL')
        .doc('EXPIRY_WED')
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.exists) {
                let documentData = querySnapshot.data();
                return documentData.data
                    .map((it) => {
                        const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
                        let expiryDate = new Date(it.expiryDate);
                        expiryDate = ('0' + expiryDate.getDate()).slice(-2) + '' + formatter.format(expiryDate).toUpperCase() + '' + expiryDate.getFullYear();
                        return { expiryDate: expiryDate, monthlyExpiry: it.monthlyExpiry }
                    })
            }
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error)
        })
};

let getBankNiftyExpiry = function () {
    return firebase
        .firestore()
        .collection('GLOBAL')
        .doc('EXPIRY_BANKNIFTY')
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.exists) {
                let documentData = querySnapshot.data();
                return documentData.data
                    .map((it) => {
                        const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
                        let expiryDate = new Date(it.expiryDate);
                        expiryDate = ('0' + expiryDate.getDate()).slice(-2) + '' + formatter.format(expiryDate).toUpperCase() + '' + expiryDate.getFullYear();
                        return { expiryDate: expiryDate, monthlyExpiry: it.monthlyExpiry }
                    })
            }
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error)
        })
};

let getCurrencyExpiry = function () {
    return firebase
        .firestore()
        .collection('GLOBAL')
        .doc('EXPIRY_CURRENCY')
        .get()
        .then(function (querySnapshot) {
            if (querySnapshot.exists) {
                let documentData = querySnapshot.data();
                return documentData.data
                    .map((it) => {
                        const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
                        let expiryDate = new Date(it.expiryDate);
                        expiryDate = ('0' + expiryDate.getDate()).slice(-2) + '' + formatter.format(expiryDate).toUpperCase() + '' + expiryDate.getFullYear();
                        return { expiryDate: expiryDate, monthlyExpiry: it.monthlyExpiry }
                    })
            }
        })
        .catch(function (error) {
            console.log('Error getting documents: ', error)
        })
};


async function getExpiryArray(symbol, expiryParam, includePrevValue = 0) {
    let expiryArr = await expiryCache();

    let expiryCount = 4;
    if (!isIndexSymbol(symbol)) {
        expiryArr = expiryArr
            .filter((it) => it.monthlyExpiry);
        expiryCount = 3 + includePrevValue;
    }

    let closetMonthIndex = expiryArr.findIndex(it => isDateGreaterThanOrEqualToTodayInIST(it.expiryDate));

    let closetExpiryMonth = expiryArr.find(it => isDateGreaterThanOrEqualToTodayInIST(it.expiryDate) && it.monthlyExpiry)?.expiryDate;

    closetMonthIndex = Math.max(closetMonthIndex - includePrevValue, 0);

    let endIndex = closetMonthIndex + Math.min(expiryArr.length, expiryCount);
    expiryArr = expiryArr
        .slice(closetMonthIndex, endIndex)
        .map((it) => it.expiryDate);

    let expiry = expiryArr.find((it) => it === expiryParam);
    expiry = expiry || expiryArr[Math.min(includePrevValue, expiryArr.length - 1)];
    return { expiryArr, expiry, closetExpiryMonth };
}

async function getTuesExpiryArray(expiryParam) {
    let expiryArr = await tuesExpiryCache();
    let closetMonthIndex = expiryArr.findIndex(it => new Date(it.expiryDate) >= yesterday());
    let endIndex = Math.min(expiryArr.length, closetMonthIndex + 4);

    expiryArr = expiryArr
        .slice(closetMonthIndex, endIndex)
        .map((it) => it.expiryDate);

    let expiry = expiryArr.find((it) => it === expiryParam);
    expiry = expiry || expiryArr[0];

    return { expiry, expiryArr }
}

async function getWedExpiryArray(expiryParam) {
    let expiryArr = await wedExpiryCache();
    let closetMonthIndex = expiryArr.findIndex(it => isDateGreaterThanOrEqualToTodayInIST(it.expiryDate));
    let endIndex = Math.min(expiryArr.length, closetMonthIndex + 4);

    expiryArr = expiryArr
        .slice(closetMonthIndex, endIndex)
        .map((it) => it.expiryDate);

    let expiry = expiryArr.find((it) => it === expiryParam);
    expiry = expiry || expiryArr[0];

    return { expiry, expiryArr }
}

async function getBankNiftyExpiryArray(expiryParam) {
    let expiryArr = await BankNiftyExpiryCache();
    let closetMonthIndex = expiryArr.findIndex(it => new Date(it.expiryDate) >= yesterday());
    let endIndex = Math.min(expiryArr.length, closetMonthIndex + 4);

    expiryArr = expiryArr
        .slice(closetMonthIndex, endIndex)
        .map((it) => it.expiryDate);

    let expiry = expiryArr.find((it) => it === expiryParam);
    expiry = expiry || expiryArr[0];

    return { expiry, expiryArr }
}

async function getCurrencyExpiryArray(expiryParam) {
    let expiryArr = await currencyExpiryCache();
    let closetMonthIndex = expiryArr.findIndex(it => new Date(it.expiryDate) >= yesterday());
    let endIndex = Math.min(expiryArr.length, closetMonthIndex + 4);

    expiryArr = expiryArr
        .slice(closetMonthIndex, endIndex)
        .map((it) => it.expiryDate);

    let expiry = expiryArr.find((it) => it === expiryParam);
    expiry = expiry || expiryArr[0];

    return { expiry, expiryArr }
}
// new Implementations

let globalExpiryDocCache = async function (docName) {
    return getFromCache(() => getGlobalExpiryArray(docName), docName, 86400);
};

async function getGlobalExpiryArray(docName, expiryParam) {
    let data = await getDocumentData("GLOBAL", docName)
    let expiryArr = [];
    if (data != null) {
        expiryArr = data.data.map((it) => {
            const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
            let expiryDate = new Date(it.expiryDate);
            expiryDate = ('0' + expiryDate.getDate()).slice(-2) + '' + formatter.format(expiryDate).toUpperCase() + '' + expiryDate.getFullYear();
            return { expiryDate: expiryDate, monthlyExpiry: it.monthlyExpiry }
        })

        let closetMonthIndex = expiryArr.findIndex(it => isDateGreaterThanOrEqualToTodayInIST(it.expiryDate));
        let endIndex = Math.min(expiryArr.length, closetMonthIndex + 4);

        expiryArr = expiryArr
            .slice(closetMonthIndex, endIndex)
            .map((it) => it.expiryDate);

    }
    else {
        throw new Error('could not fetch data');
    }
    return { expiryArr }
}

async function processExpiryService(symbol, expiryQueryParam) {
    const cacheKeys = {
        FINNIFTY: { name: "EXPIRY_TUES", toIndex: 4 },
        MIDCPNIFTY: { name: "EXPIRY_WED", toIndex: 4 },
        BANKNIFTY: { name: "EXPIRY_BANKNIFTY", toIndex: 4 },
        USDINR: { name: "EXPIRY_CURRENCY", toIndex: 2 },
        NATURALGAS: { name: "EXPIRY_NATURALGAS", toIndex: 2 },
        CRUDEOIL: { name: "EXPIRY_CRUDEOIL", toIndex: 2 },
        GOLD: { name: "EXPIRY_GOLD", toIndex: 1 },
    };

    const cacheKeysV2 = {
        SENSEX: { name: "SENSEX", toIndex: 4 },
        BANKEX: { name: "BANKEX", toIndex: 4 }
    };

    let expiryArr = [], expiry = null, closetExpiryMonth = null;
    ({ expiryArr, expiry, closetExpiryMonth } = await getExpiryArray(symbol, expiryQueryParam));
    let cacheResult = cacheKeys[symbol];
    if (cacheResult) {
        ({ expiryArr } = await globalExpiryDocCache(cacheResult.name, expiryQueryParam));
        expiryArr = expiryArr.slice(0, Math.min(cacheResult.toIndex, expiryArr.length))
        expiry = expiryArr?.find((it) => it === expiryQueryParam) ?? expiryArr[0];
    } else if (cacheKeysV2[symbol]) {
        ({ expiryArr, expiry, closetExpiryMonth } = await processExpiryServiceV2(symbol, expiryQueryParam));
    }

    return { expiryArr, expiry, closetExpiryMonth };
}


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
    const specialOpenDate = now.getUTCFullYear() === 2024 && now.getUTCMonth() === 4 && now.getUTCDate() === 18;

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
        const query = { symbol: symbol, manually_deactivated: { $ne: true }, active_status: true };
        cursor = await collection.find(query);
        const dataArr = (await cursor.toArray())
        data = dataArr?.map(doc => ({ expiryDate: doc.expiry?.toUpperCase() }))?.sort((a, b) => +new Date(a.expiryDate) - +new Date(b.expiryDate));
        // console.log(data);
    } catch (error) {
        LOGGER.error(`Error occurred maxpainv2 ${symbol} ${expiry}: ${error}`);
    }
    return data;
}

let getSymbolExpiryForCache = async function (symbol) {
    let Ex = getSecondsRemainingBeforeMidnightIST();
    return getFromCache(() => getSymbolExpiryFor(symbol), `${CACHE_NEW.SYMBOL_EXPIRIES}:${symbol}`, Ex);
};

async function processExpiryServiceV2(symbol, expiryParam, expiryCount = 8, includePrevValue = 0) {
    let expiryArr = await getSymbolExpiryForCache(symbol);

    let closetMonthIndex = expiryArr.findIndex(it => isDateGreaterThanOrEqualToTodayInIST(it.expiryDate));

    let closetExpiryMonth = expiryArr[closetMonthIndex]?.expiryDate;

    closetMonthIndex = Math.max(closetMonthIndex - includePrevValue, 0);

    let endIndex = closetMonthIndex + Math.min(expiryArr.length, expiryCount);
    expiryArr = expiryArr
        .slice(closetMonthIndex, endIndex)
        // .slice(closetMonthIndex, expiryArr.length)
        .map((it) => it.expiryDate);

    let expiry = expiryArr.find((it) => it === expiryParam);
    expiry = expiry || expiryArr[Math.min(includePrevValue, expiryArr.length - 1)];
    return { expiryArr, expiry, closetExpiryMonth };
}





module.exports.getExpiryArray = getExpiryArray;
module.exports.getTuesExpiryArray = getTuesExpiryArray;
module.exports.getWedExpiryArray = getWedExpiryArray;
module.exports.getBankNiftyExpiryArray = getBankNiftyExpiryArray;
module.exports.getCurrencyExpiryArray = getCurrencyExpiryArray;
module.exports.processExpiryService = processExpiryServiceV2;
module.exports.processExpiryServiceOld = processExpiryService;
module.exports.isMarketOpenFor = isMarketOpenFor;

