var express = require("express");
var router = express.Router();
const { seoHeadTagValues } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
const asyncMiddleware = require("../config/asyncMiddleware.config");

let trades = [];

router.get("/", (req, res) => {
  res.render("trades/trades", {
    menu: "Journal",
    ...seoHeadTagValues(PAGE_NAME.HOME),
    trades,
  });
});

router.get("/add", (req, res) => {
  res.render("trades/addTrade", {
    menu: "Journal",
    ...seoHeadTagValues(PAGE_NAME.HOME),
    trades,
    message: null,
  });
});

router.get("/api/trades", (req, res) => {
  // localhost:5110/trade/api/trades
  res.json(trades);
});

router.post("/add", (req, res) => {
  // localhost:5110/trade/add
  const { stockName, price, orderType } = req.body;

  if (stockName && price && orderType) {
    trades.push({ stockName, price, orderType });
  }

  const newTrade = { stockName, price, orderType };
  trades.push(newTrade);
  
  res.render("trades/addTrade", {
    menu: "Journal",
    ...seoHeadTagValues(PAGE_NAME.HOME),
    trades,
    message: "Trade added successfully",
  });
  // res.status(201).json(newTrade);
});

module.exports = router;
