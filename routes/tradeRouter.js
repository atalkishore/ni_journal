const express = require("express");
const router = express.Router();
const { seoHeadTagValues } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
const { mongodb } = require("../baseMongoDbRepository");

const tradesCollection = mongodb.collection("trades");

router.get("/", async (req, res) => {
  try {
    const trades = await tradesCollection.find({}).toArray();
    res.render("trades/trades", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
      trades,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trades", error });
  }
});

router.get("/add", (req, res) => {
  res.render("trades/addTrade", {
    menu: "Journal",
    ...seoHeadTagValues(PAGE_NAME.HOME),
    message: null,
    error: null,
  });
});

router.get("/api/trades", async (req, res) => {
  try {
    const trades = await tradesCollection.find({}).toArray();
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trades", error });
  }
});

router.post("/add", async (req, res) => {
  const { stockName, price, orderType } = req.body;

  if (!stockName || !price || !orderType) {
    return res.render("trades/addTrade", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
      message: "Please fill out all fields",
    });
  }

  try {
    const newTrade = { stockName, price, orderType };
    await tradesCollection.insertOne(newTrade);
    res.render("trades/addTrade", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
      message: "Trade added successfully",
    });
  } catch (error) {
    res.render("trades/addTrade", {
      menu: "Journal",
      ...seoHeadTagValues(PAGE_NAME.HOME),
      message: "Failed to add trade",
    });
  }
});

router.delete("/api/trade-del", async (req, res) => {
  const { stockName } = req.body;

  if (!stockName) {
    return res
      .status(400)
      .json({ status: "error", message: "Stock name is required." });
  }

  try {
    const result = await tradesCollection.deleteOne({ stockName });
    if (result.deletedCount === 1) {
      res.json({
        status: "ok",
        message: `${stockName} Trade Deleted Successfully.`,
      });
    } else {
      res.status(404).json({ status: "error", message: "Trade not found." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to delete trade", error });
  }
});

module.exports = router;
