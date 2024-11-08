var express = require('express');
var router = express.Router();
const { seoHeadTagValues } = require("../utils/helpers");
const { PAGE_NAME } = require("../utils/constants");
const asyncMiddleware = require("../config/asyncMiddleware.config");

router.get('/', asyncMiddleware(async (req, res) => {
    res.render('journal/main', { menu: "", ...seoHeadTagValues(PAGE_NAME.HOME) });
}));



module.exports = router;