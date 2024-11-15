const express = require("express");
const router = express.Router();
const { seoHeadTagValues } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
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
    message: null,
    error: null,
  });
});

router.get("/api/trades", (req, res) => {
  res.json(trades);
});

router.post("/add", (req, res) => {
  const { stockName, price, orderType } = req.body;

  if (stockName && price && orderType) {
    const newTrade = { stockName, price, orderType };
    trades.push(newTrade);
    res.render("trades/addTrade", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
      trades,
      message: "Trade added successfully",
      error: null,
    });
  } else {
    res.render("trades/addTrade", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
      trades,
      message: "Please fill out all fields",
      error: null,
    });
  }
});

router.delete("/api/trade-del", (req, res) => {
  const { index } = req.body;

  if (index >= 0 && index < trades.length) {
    const deletedTrade = trades.splice(index, 1);
    res.json({
      status: "ok",
      message: `${deletedTrade[0].stockName} Trade Deleted Successfully`,
    });
  } else {
    res.status(404).json({ status: "error", message: "Trade not found." });
  }
});

module.exports = router;
