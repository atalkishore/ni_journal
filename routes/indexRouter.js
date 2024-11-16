import * as axios from 'axios';
import { Router } from 'express';

import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { DISP_NAME, VERSION } from '../config/env.constant.js';
import { LOGGER } from '../config/winston-logger.config.js';
import { getTickers } from '../repository/tickerRepository.js';
import { PAGE_NAME } from '../utils/constants.js';
import { tickerFormatting, seoHeadTagValues } from '../utils/index.js';

const router = Router();
/* GET home page. */

router.get(
  '/',
  asyncMiddleware(async function (req, res) {
    const tickers = await getTickers();
    const { dict, dictNameToSymbolMap } = tickerFormatting(tickers, '');
    const j = 'username';

    res.render('index', {
      menu: j,
      ...seoHeadTagValues(PAGE_NAME.HOME),
      tickers: JSON.stringify(dict),
      tickersMap: JSON.stringify(dictNameToSymbolMap),
    });
  })
);

router.get(
  '/404',
  asyncMiddleware(function (req, res) {
    let source = decodeURIComponent(req.query.source) || '';
    source = source === 'undefined' ? '' : source;
    res.status(404).render('404', {
      menu: '404',
      title: 'Not-Found',
      description: 'Page not found',
      source,
      keywords: '',
    });
  })
);

router.get(
  '/500',
  asyncMiddleware(function (req, res) {
    res
      .status(req.params.status)
      .render('404', { menu: '500', title: 'Error' });
  })
);

router.get(
  '/coming-soon',
  asyncMiddleware(function (req, res) {
    res.render('coming-soon', { menu: '500', ...seoHeadTagValues('ERROR') });
  })
);

router.get(
  '/health',
  asyncMiddleware(async function (req, res) {
    res.json({
      status: 'up',
      version: VERSION,
      app_name: DISP_NAME,
    });
  })
);

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
    // eslint-disable-next-line no-unused-vars
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
      LOGGER.debug('Error fetching the file:', error);
      res.status(500).send('Error fetching the file');
    }
  }
});
export default router;
