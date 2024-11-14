var express = require("express");
var router = express.Router();
const { seoHeadTagValues } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
const asyncMiddleware = require("../config/asyncMiddleware.config");
const { error } = require("winston");

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
    message:null,
    error:null,
  });
});

router.get("/api/trades", (req, res) => {
  // localhost:5110/trade/api/trades
  res.json(trades);
});

router.post("/add", (req, res) => {
  // localhost:5110/trade/add
  const { stockName, price, orderType } = req.body;

  if (stockName === "SBI") {
    return res.render("trades/addTrade", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
      trades,
      message: null,
      error: "Cannot add stock", 
    });
  }

  const newTrade = { stockName, price, orderType };
  trades.push(newTrade);

  res.render("trades/addTrade", {
    menu: "Journal",
    ...seoHeadTagValues(PAGE_NAME.HOME),
    trades,
    message: "Trade added successfully",
    error:null,
  });
  // res.status(201).json(newTrade);
});

module.exports = router;
