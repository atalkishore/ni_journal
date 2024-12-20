import moment from 'moment-timezone';
import { ObjectId } from 'mongodb';

const istOffset = 5.5 * 60 * 60 * 1000;
const dateFormat = 'DDMMMYYYY';

const notFoundPage = (res) => {
  res.render('404', {
    page: '404',
  });
};
const redirectTo404 = (res) =>
  res.status(404).render('404', {
    menu: '404',
    title: 'Not-Found',
    description: 'Page not found',
    source: '/',
    keywords: '',
  });

const redirectOnException = (res) => res.status(301).redirect('/');

// eslint-disable-next-line no-unused-vars
const internalServerError = (res) => {
  res.render('500', {
    page: '500',
  });
};

function groupByKey(data, keyFn = (e) => e.ticker.symbol[0]) {
  const reduce = data.reduce((r, e) => {
    // get first letter of name of current element
    const group = keyFn(e);
    // if there is no property in accumulator with this letter create it
    if (!r[group]) {
      r[group] = { group, children: [e] };
    }
    // if there is push current element to children array for that letter
    else {
      r[group].children.push(e);
    }
    // return accumulator
    return r;
  }, {});
  return Object.values(reduce);
}

function tickerFormatting(tickers, excludeSymbol) {
  const dict = {};
  const dictNameToSymbolMap = {};
  const dictSymbolToNameMap = {};
  tickers.forEach((x) => {
    if (x.ticker.symbol !== excludeSymbol) {
      dict[`${x.ticker.symbol} - ${x.ticker.name}`] = null;
      dictNameToSymbolMap[`${x.ticker.symbol} - ${x.ticker.name}`] =
        x.ticker.symbol;
      dictSymbolToNameMap[`${x.ticker.symbol}`] =
        `${x.ticker.symbol} - ${x.ticker.name}`;
    }
  });
  const tickerGroup = groupByKey(tickers);
  return { dict, dictNameToSymbolMap, dictSymbolToNameMap, tickerGroup };
}

function capitalizeWords(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function showLiveTicker(symbol) {
  return (
    symbol === 'BANKNIFTY' ||
    symbol === 'NIFTY' ||
    symbol === 'NIFTYIT' ||
    symbol === 'MCDOWELL-N'
  );
}

function yesterday() {
  return new Date(new Date().setDate(new Date().getDate() - 1));
}
function todayIST() {
  return new Date(new Date().getTime() + istOffset);
}

function isDateGreaterThanOrEqualToTodayInIST(date) {
  // Create a Moment object for the current date in IST
  const currentDateIST = moment().tz('Asia/Kolkata').startOf('day');

  // Create a Moment object for the input date
  const inputDate = moment(date, dateFormat).tz('Asia/Kolkata').startOf('day');

  // Compare the input date with the current date
  return inputDate.isSameOrAfter(currentDateIST);
}

function isThursday(day) {
  return day === 4;
}

function indexSymbol() {
  return [
    'NIFTY',
    'BANKNIFTY',
    'MIDCPNIFTY',
    'FINNIFTY',
    'NIFTYNXT50',
    'SENSEX',
    'BANKEX',
  ];
}

function isIndexSymbol(symbol) {
  return indexSymbol().includes(symbol?.toUpperCase());
}

function isCurrencySymbol(symbol) {
  symbol = symbol.toUpperCase();
  return symbol === 'USDINR';
}
// eslint-disable-next-line no-unused-vars
function isCommoditySymbol(symbol) {
  symbol = symbol.toUpperCase();
  return symbol === 'NATURALGAS' || symbol === 'CRUDEOIL' || symbol === 'GOLD';
}

function isCurrOrCommoditySymbol(symbol) {
  symbol = symbol.toUpperCase();
  return (
    symbol === 'USDINR' ||
    symbol === 'NATURALGAS' ||
    symbol === 'CRUDEOIL' ||
    symbol === 'GOLD'
  );
}

function generateCacheKeys(cacheName, symbol, expiry) {
  const cacheKey = `${cacheName}_${isIndexSymbol(symbol) ? `INDEX` : expiry}`;
  const primaryKey = `${isIndexSymbol(symbol) ? `${symbol}_${expiry}` : `${symbol}`}`;
  return { cacheKey, primaryKey };
}

function getClassNameForPCR(val) {
  if (val > 0 && val <= 0.8) {
    return 'danger';
  } else if (val >= 1.2) {
    return 'success';
  } else if (val === 0) {
    return 'secondary';
  } else {
    return 'info';
  }
}

function getTextForPCR(val) {
  if (val > 0 && val <= 0.8) {
    return 'Bearish Trend';
  } else if (val >= 1.2) {
    return 'Bullish Trend';
  } else if (val === 0) {
    return 'InSufficient Data';
  } else {
    return 'Neutral Trend';
  }
}

function capitalizeFirstLetterOfEachWord(name) {
  return (
    name
      ?.toLowerCase() // Convert the entire string to lowercase
      ?.replace(/\b\w/g, (char) => char.toUpperCase()) ?? ''
  ); // Capitalize the first letter of each word
}
function toObjectID(resourceId) {
  if (resourceId instanceof ObjectId) {
    return resourceId;
  }

  if (
    typeof resourceId === 'string' &&
    resourceId.trim() !== '' &&
    ObjectId.isValid(resourceId)
  ) {
    return new ObjectId(resourceId);
  }

  throw new Error('Invalid resource ID');
}
export {
  getTextForPCR,
  getClassNameForPCR,
  notFoundPage,
  redirectTo404,
  redirectOnException,
  groupByKey,
  tickerFormatting,
  capitalizeWords,
  showLiveTicker as showLiveTickerFor,
  yesterday,
  isThursday,
  isIndexSymbol,
  isCurrOrCommoditySymbol,
  isCurrencySymbol,
  generateCacheKeys,
  todayIST,
  indexSymbol,
  isDateGreaterThanOrEqualToTodayInIST,
  capitalizeFirstLetterOfEachWord,
  toObjectID,
};
