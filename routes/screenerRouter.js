const express = require('express');
const { getScreener } = require("../repository/screenerRepository");
const { seoHeadTagValues } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
const asyncMiddleware = require("../config/asyncMiddleware.config");
const router = express.Router();

router.get('/', asyncMiddleware(async function (req, res, next) {

    const screeners = getScreenerMeta()
    let allStocksTechnicals = await getScreener();
    let lastUpdatedOn = allStocksTechnicals[0].lastUpdatedOn;
    res.render('screener/screener-tool',
        {
            menu: 'Screener',
            ...seoHeadTagValues(""),
            screeners: screeners,
            screenersSelected: [],
            filteredStocks: [],
            lastUpdatedOn
        });
}));


router.get('/search', asyncMiddleware(async function (req, res, next) {

    let encodedURI2 = req.query.data;
    let text = decodeURI(encodedURI2);
    let requestedScreeners;
    if (text) {
        try {
            requestedScreeners = JSON.parse(text);
        } catch (e) {
            return res.redirect("/");
        }
    }



    /* validate the screeners
     * crete the screener for right pan from the selected screener */
    let validScreeners = validateScreeners(requestedScreeners);
    console.log(validScreeners)
    const screeners = getScreenerMeta().map(screener => {
        let filter = validScreeners.filter(x => x.n === screener.name.key);
        let disabledFreq = [];
        if (filter) {
            disabledFreq = filter.map(it => it.tl)
        }
        return ({ ...screener, disabledFreq: disabledFreq });
    })
    // if valid scan all the stocks and create filtered stocks

    let allStocksTechnicals = await getScreener();
    let lastUpdatedOn = allStocksTechnicals[0].lastUpdatedOn;

    let filteredStocks = screenStocks(validScreeners, allStocksTechnicals);


    // crete the screener for left pan removing choosed screener
    // const reqScreenerName = validScreeners.map(x => x.n);
    // const leftScreeners = screeners.filter((x) => !reqScreenerName.includes(x.name))
    // console.log(data);

    res.render('screener/screener-tool',
        {
            menu: 'Screener',

            ...seoHeadTagValues(""),
            screeners: screeners,
            screenersSelected: validScreeners,
            filteredStocks: filteredStocks,
            lastUpdatedOn
        });
}));

const jsonType = [{ "n": "ADX", "ot": 1, "tl": "D", "op": "=", "v1": 0, "v2": 10 }]
const Operator = {
    EQUAL: "=",
    LESS_THAN: "<",
    GREATER_THAN: ">",
    RANGE: "BETWEEN",
    BELOW: "BELOW",
    ABOVE: "ABOVE",

};
Object.freeze(Operator);
const Frequency = {
    DAILY: "D",
    WEEKLY: "W",
    MONTHLY: "M"
};
Object.freeze(Frequency);

function getScreenerMeta() {

    const Screener = {
        ADX: { key: 'ADX', display: 'Adx' },
        MACD: { key: 'MACD', display: 'MACD' },
        GAP_PER: { key: 'GAP_PER', display: 'Gap %' },
        WR: { key: 'WR', display: 'Wr' },
        RSI: { key: 'RSI', display: 'Rsi' },
        STOCH_RSI: { key: 'STOCH_RSI', display: 'Stoch Rsi' },
        DELIVERY_PER: { key: 'DELIVERY_PER', display: 'Delivery %' },
        VOLATILITY: { key: 'VOLATILITY', display: 'Volatility' },
        DAY_GAIN_LOSS: { key: 'GAIN_LOSS_PER', display: 'Gain / Loss %' },
        DAY_LOSS: { key: 'DAY_LOSS', display: 'Day Loss' },
        HAS_EVENTS: { key: 'HAS_EVENTS', display: 'Has Events' },
        HAS_NEW_YEAR_HIGH: { key: 'HAS_NEW_YEAR_HIGH', display: 'has New year high' },
        HAS_NEW_YEAR_LOW: { key: 'HAS_NEW_YEAR_LOW', display: 'has new year low' },
        SMA9: { key: 'SMA9', display: 'SMA 9' },
        SMA20: { key: 'SMA20', display: 'SMA 20' },
        SMA50: { key: 'SMA50', display: 'SMA 50' },
        SMA100: { key: 'SMA100', display: 'SMA 100' },
        SMA200: { key: 'SMA200', display: 'SMA 200' },
        EMA9: { key: 'EMA9', display: 'EMA 9' },
        EMA20: { key: 'EMA20', display: 'EMA 20' },
        EMA50: { key: 'EMA50', display: 'EMA 50' },
        EMA100: { key: 'EMA100', display: 'EMA 100' },
        EMA200: { key: 'EMA200', display: 'EMA 200' },
        MAXPAIN: { key: 'MAXPAIN', display: 'Max Pain' },
        PCR: { key: 'PCR', display: 'PCR' },


    };

    Object.freeze(Screener);

    const tool = [
        {
            name: Screener.ADX,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            valid_range: [0, 100],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.MACD,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            valid_range: [0, 100],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.GAP_PER,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            value_type: "%",
            valid_range: [0, 100],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.WR,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            valid_range: [-100, 0],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.RSI,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            valid_range: [0, 100],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.STOCH_RSI,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            valid_range: [0, 100],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.DELIVERY_PER,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            value_type: "%",
            valid_range: [0, 100],
            frequency: [Frequency.DAILY]
        },
        {
            name: Screener.VOLATILITY,
            operator_type: 1,
            operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            valid_range: [0, 100],
            frequency: [Frequency.DAILY]
        },
        {
            name: Screener.DAY_GAIN_LOSS,
            operator_type: 1,
            operator: [Operator.EQUAL, Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
            value_type: "%",
            valid_range: [-100, 100],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        // {
        //     name: Screener.DAY_LOSS,
        //     operator_type: 1,
        //     operator: [Operator.EQUAL, Operator.LESS_THAN, Operator.GREATER_THAN, Operator.RANGE],
        //     valid_range: [0, 100]
        // },
        // {
        //     name: Screener.HAS_EVENTS,
        //     operator_type: 3
        // },
        // {
        //     name: Screener.HAS_NEW_YEAR_HIGH,
        //     operator_type: 3
        // },
        // {
        //     name: Screener.HAS_NEW_YEAR_LOW,
        //     operator_type: 3
        // },
        {
            name: Screener.SMA9,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.SMA20,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.SMA50,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.SMA100,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.SMA200,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.EMA9,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.EMA20,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.EMA50,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.EMA100,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        {
            name: Screener.EMA200,
            operator_type: 2,
            operator: [Operator.BELOW, Operator.ABOVE],
            frequency: [Frequency.DAILY, Frequency.WEEKLY, Frequency.MONTHLY]
        },
        // {
        //     name: Screener.MAXPAIN,
        //     operator_type: 2,
        //     operator: [Operator.BELOW, Operator.ABOVE]
        // },
        // {
        //     name: Screener.PCR,
        //     operator_type: 1,
        //     operator: [Operator.GREATER_THAN, Operator.LESS_THAN, Operator.RANGE],
        //     valid_range: [0, 100]
        // }
    ];

    return tool;
}

function validateScreeners(requestedScreeners = jsonType) {
    const screeners = getScreenerMeta()
    let newScreneers = [];
    requestedScreeners.forEach(
        (it) => {
            let find = screeners.find((x) => x.name.key === it.n);
            let duplicate = newScreneers.find((x) => x.n === it.n && x.tl === it.tl);
            if (find && !duplicate) {
                if (it.ot === find.operator_type) {
                    if (find.operator.includes(it.op)) {
                        if (
                            (!it.v1 || it.v1 >= find.valid_range[0] && it.v1 <= find.valid_range[1]) &&
                            (!it.v2 || it.v2 >= find.valid_range[0] && it.v2 <= find.valid_range[1])
                        ) {
                            let v2Val = it.op.toUpperCase() === "BETWEEN" ? { v2: it.v2 } : {};
                            newScreneers.push({
                                n: find.name.key,
                                display: find.name.display,
                                ot: it.ot,
                                op: it.op,
                                tl: it.tl,
                                v1: it.v1,
                                value_type: find.value_type,
                                ...v2Val
                            })
                        }
                    }
                }
            }
        }
    )
    return newScreneers;

}

function screenStocks(validScreeners, allStockTechnicals) {

    let arr = [];
    allStockTechnicals.forEach((ta, counter) => {
        let isValid = true;
        let ltp = ta.ltp;
        validScreeners.forEach((screener) => {
            let stockTa;
            let key = screener.n.toLowerCase();
            if (screener.tl === "W") stockTa = ta.weekly;
            else if (screener.tl === "M") stockTa = ta.monthly;
            else if (screener.tl === "D") stockTa = ta.daily;
            else stockTa = ta;
            let stockTaElement = parseFloat(stockTa[key]);


            if (screener.ot === 1) {
                switch (screener.op) {
                    case Operator.EQUAL:
                        if (stockTaElement !== parseFloat(screener.v1)) isValid = false
                        break;
                    case Operator.GREATER_THAN:
                        if (!(stockTaElement > parseFloat(screener.v1))) isValid = false
                        break;
                    case Operator.LESS_THAN:
                        if (!(stockTaElement <= parseFloat(screener.v1))) isValid = false
                        break;
                    case Operator.RANGE:
                        if (!(stockTaElement >= parseFloat(screener.v1) && stockTaElement <= parseFloat(screener.v2))) isValid = false
                        break;
                    default:
                        isValid = false
                }
            } else if (screener.ot === 2) {
                switch (screener.op) {
                    case Operator.BELOW:
                        if (parseFloat(ltp) > stockTaElement) isValid = false
                        break;
                    case Operator.ABOVE:
                        if (parseFloat(ltp) < stockTaElement) isValid = false
                        break;
                    default:
                        isValid = false
                }
            } else {
                isValid = false;
            }

        })

        if (isValid) {
            arr.push({ ...ta, ltp });
        }
    })

    return arr;
}

module.exports = router;

