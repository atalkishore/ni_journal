import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { tradeRepository } from '../repository/tradeRepository.js';
import { seoHeadTagValues, PAGE_NAME } from '../utils/index.js';

router.get(
  '/',
  asyncMiddleware(async (req, res) => {
    res.render('journal/dashboard', {
      menu: 'Journal',
      currentPath: 'journal/dashboard',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);

router.get(
  '/tradejournal',
  asyncMiddleware(async (req, res) => {
    res.render('journal/journal', {
      menu: 'Journal',
      currentPath: 'journal/journal',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);

router.get(
  '/analyse',
  asyncMiddleware(async (req, res) => {
    res.render('journal/analyse', {
      menu: 'Journal',
      currentPath: '/journal/analyse',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);

// get- localhost:5110/journal/addTrade

router.get('/addTrade', async (req, res) => {
  res.render('journal/addTrade', {
    menu: 'Journal',
    currentPath: '/journal/addTrade',
    title: 'Add Trade - Nifty Invest',
    description: 'Easily add your trades.',
    keywords: 'add trade, investments, stock journal, nifty invest',
    CANONICAL_URL: 'https://niftyinvest.com/journal/addTrade',
  });
});

// get- localhost:5110/journal/trades

router.get('/trades', async (req, res) => {
  try {
    const { tradeId, mode } = req.query;

    if (tradeId && mode === 'edit') {
      const tradeDetails = await tradeRepository.getTradeById(tradeId);
      if (!tradeDetails) {
        return res.status(404).render('error', {
          status: 'Failure',
          message: 'Trade not found.',
          data: null,
        });
      }

      return res.render('journal/editTrade', {
        menu: 'Journal',
        currentPath: `/journal/trades?tradeId=${tradeId}&mode=edit`,
        title: 'Edit Trade - Nifty Invest',
        description: 'Edit trade details.',
        keywords: 'edit trade, investments, stock journal, nifty invest',
        CANONICAL_URL: `https://niftyinvest.com/journal/trades/editTrade/${tradeId}`,
        trade: tradeDetails,
      });
    }

    if (tradeId) {
      const tradeDetails = await tradeRepository.getTradeById(tradeId);
      if (!tradeDetails) {
        return res.status(404).render('error', {
          status: 'Failure',
          message: 'Trade not found.',
          data: null,
        });
      }

      return res.render('journal/tradeDetails', {
        menu: 'Journal',
        currentPath: `/journal/trades?tradeId=${tradeId}`,
        title: 'Trade Details - Nifty Invest',
        description: 'View trade details.',
        keywords: 'trade details, investments, stock journal, nifty invest',
        CANONICAL_URL: `https://niftyinvest.com/journal/tradeDetails/${tradeId}`,
        trade: tradeDetails,
      });
    }

    const trades = await tradeRepository.getTrades();
    return res.render('journal/tradeList', {
      menu: 'Journal',
      currentPath: '/journal/trades',
      title: 'Trades - Nifty Invest',
      description: 'List of trades.',
      keywords: 'trades list, investments, stock journal, nifty invest',
      CANONICAL_URL: 'https://niftyinvest.com/journal/trades',
      trades,
    });
  } catch (error) {
    return res.status(500).render('error', {
      status: 'Failure',
      message: 'Failed to fetch trades.',
      data: null,
    });
  }
});

router.get('/manageStrategies', (req, res) => {
  res.render('journal/manageStrategies', {
    menu: 'Journal',
    currentPath: '/journal/manageStrategies',
    title: 'Add Trade - Nifty Invest',
    description: 'Easily add your trades.',
    keywords: 'add trade, investments, stock journal, nifty invest',
    CANONICAL_URL: 'https://niftyinvest.com/journal/addTrade',
  });
});

export default router;
