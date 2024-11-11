const express = require('express');
const app = express();
const PORT = 5110;

app.use(express.json());

let trades = [];

app.get('/api/trades', (req, res) => {
    res.json(trades);
});

app.post('/api/trades', (req, res) => {
    const { stockName, price, orderType } = req.body;

    if (!stockName || !price || !['buy', 'sell'].includes(orderType)) {
        return res.status(400).json({ error: 'Invalid trade data' });
    }

    const newTrade = { stockName, price, orderType };
    trades.push(newTrade);

    res.status(201).json(newTrade);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});