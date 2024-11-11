var express = require('express');
var router = express.Router();


let trades = [];

router.get('/api/trades', (req, res) => {
    res.json(trades);
});

router.post('/api/trades', (req, res) => {
    const { stockName, price, orderType } = req.body;

    if (!stockName || !price || !['buy', 'sell'].includes(orderType)) {
        return res.status(400).json({ error: 'Invalid trade data' });
    }

    const newTrade = { stockName, price, orderType };
    trades.push(newTrade);

    res.status(201).json(newTrade);
});


module.exports = router;