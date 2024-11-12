var express = require("express");
var router = express.Router();
const { seoHeadTagValues } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
const asyncMiddleware = require("../config/asyncMiddleware.config");

let trades = [
  { stockName: "SBIN", orderType: "MARKET ORDER", price: "550" },
  { stockName: "TATA", orderType: "LIMIT ORDER", price: "500" },
  { stockName: "SUZLON", orderType: "STOP ORDER", price: "50" },
];

router.get("/", (req, res) => {
  res.render("trades/trades", {
    menu: "Journal",
    ...seoHeadTagValues(PAGE_NAME.HOME),
    trades,
  });
});

router.get("/", (req, res) => {
  res.render("trades/addTrade", {
    menu: "Journal",
    ...seoHeadTagValues(PAGE_NAME.HOME),
  });
});

router.get("/api/trades", (req, res) => {
  res.json(trades);
});

router.post("/api/trades", (req, res) => {
  const { stockName, price, orderType } = req.body;

  if (!stockName || !price || !["buy", "sell"].includes(orderType)) {
    return res.status(400).json({ error: "Invalid trade data" });
  }

  const newTrade = { stockName, price, orderType };
  trades.push(newTrade);

  res.status(201).json(newTrade);
});

module.exports = router;
