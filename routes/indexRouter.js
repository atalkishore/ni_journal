var express = require('express');
const axios = require('axios');
var router = express.Router();
const repository = require('../repository/tickerRepository');
const { tickerFormatting, seoHeadTagValues, isIndexSymbol, indexSymbol } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
const { getStockQuote } = require("../repository/indicesRepository");
const { getSgxNifty } = require("../repository/indicesRepository");
const asyncMiddleware = require("../config/asyncMiddleware.config");

var request = require('request');

/* GET home page. */

router.get('/', asyncMiddleware(async function (req, res, next) {
    let allStockQuote = (await getStockQuote())?.data;
    let allIndices = allStockQuote;

    let tickers = await repository.getTickers();
    let { dict, dictNameToSymbolMap } = tickerFormatting(tickers, "");
    res.render('index', {
        menu: '',
        ...seoHeadTagValues(PAGE_NAME.HOME),
        tickers: JSON.stringify(dict),
        tickersMap: JSON.stringify(dictNameToSymbolMap),
    });
}));

router.get('/lot-size', asyncMiddleware(async function (req, res, next) {
    let tickers = await repository.getTickers();
    let lotSizeStocks = [];
    let lotsizeIndex = [];
    tickers.forEach(ticker => {

        if (ticker.instrument === 'OPTSTK') {
            lotSizeStocks.push(ticker);
        } else {
            lotsizeIndex.push(ticker);
        }
    });
    res.render('lot-size/lotSize', {
        ...seoHeadTagValues(PAGE_NAME.LOT_SIZE),
        menu: 'lot size',
        lotSizeStocks: lotSizeStocks,
        lotsizeIndex: lotsizeIndex
    });
}));

router.get('/404', asyncMiddleware(function (req, res, next) {
    let source = decodeURIComponent(req.query.source) || "";
    source = source === 'undefined' ? "" : source;
    res
        .status(404)
        .render('404', { menu: '404', title: 'Not-Found', description: "Page not found", source, keywords: "" });
}));

router.get('/500', asyncMiddleware(function (req, res, next) {
    res.status(req.params.status).render('404', { menu: '500', title: 'Error' });
}));

router.get('/coming-soon', asyncMiddleware(function (req, res, next) {
    res.render('coming-soon', { menu: '500', ...seoHeadTagValues("ERROR") });
}));


router.get('/health', asyncMiddleware(async function (req, res, next) {
    res.json({ status: 'up', version: process.env.VERSION, app_name: process.env.DISP_NAME })
}));


router.get('/sitemap.xml', async (req, res) => {
    try {
        // URL of the remote file
        const fileUrl = 'https://static.niftyinvest.com/xml/sitemap.xml';

        // Fetch the file from the remote URL
        const response = await axios.get(fileUrl, { responseType: 'text' });

        // Set the appropriate Content-Type for XML if required
        res.setHeader('Content-Type', 'application/xml');

        // Send the fetched file content as a response
        res.send(response.data);
    } catch (error) {
        // Handle errors
        try {
            // URL of the remote file
            const fileUrl = 'https://niftyinvest.com/xml/sitemap.xml';
    
            // Fetch the file from the remote URL
            const response = await axios.get(fileUrl, { responseType: 'text' });
    
            // Set the appropriate Content-Type for XML if required
            res.setHeader('Content-Type', 'application/xml');
    
            // Send the fetched file content as a response
            res.send(response.data);
        } catch (error) {
            // Handle errors
            console.error('Error fetching the file:', error);
            res.status(500).send('Error fetching the file');
        }
    }
});
module.exports = router;
