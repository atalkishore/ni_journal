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
router.get('/addTrade', async (req, res) => {
  res.render('journal/addTrade', {
    menu: 'Journal',
    currentPath: '/journal/addTrade',
    title: 'Add Trade - Nifty Invest',
    description: 'Easily add your trades to track your investments.',
    keywords: 'add trade, investments, stock journal, nifty invest',
    CANONICAL_URL: 'https://niftyinvest.com/journal/addTrade',
  });
});

router.post('/addTrade', async (req, res) => {
  try {
    const { stockName, price, stockType } = req.body;
    await tradeRepository.addTrade({
      stockName,
      price,
      stockType,
      createdAt: new Date(),
    });
    res.json({ success: true, message: 'Trade added successfully!' });
  } catch (err) {
    // console.error(err);
    res.json({ success: false, message: 'Failed to add trade.' });
  }
});

router.get('/trades', async (req, res) => {
  try {
    const trades = await tradeRepository.getTrades();
    res.render('journal/tradeList', {
      menu: 'Journal',
      currentPath: '/journal/trades',
      title: 'Trade List - Nifty Invest',
      description: 'View and manage your trade history.',
      keywords: 'trade list, investments, stock journal, nifty invest',
      CANONICAL_URL: 'https://niftyinvest.com/journal/trades',
      trades,
    });
  } catch (err) {
    // console.error(err);
    res.render('journal/tradeList', {
      menu: 'Journal',
      currentPath: '/journal/trades',
      trades: [],
      error: 'Unable to fetch trades',
    });
  }
});

router.get(
  '/leaderboard',
  asyncMiddleware(async (req, res) => {
    res.render('journal/leaderboard', {
      menu: 'Journal',
      currentPath: '/journal/leaderboard',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);
router.get(
  '/liquidity',
  asyncMiddleware(async (req, res) => {
    res.render('journal/liquidity', {
      menu: 'Journal',
      currentPath: '/journal/liquidity',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);
router.get(
  '/strategies',
  asyncMiddleware(async (req, res) => {
    res.render('journal/strategies', {
      menu: 'Journal',
      currentPath: '/journal/strategies',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);
router.get(
  '/overview',
  asyncMiddleware(async (req, res) => {
    res.render('journal/overview', {
      menu: 'Journal',
      currentPath: '/journal/overview',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);
router.get(
  '/portfolio',
  asyncMiddleware(async (req, res) => {
    res.render('journal/portfolio', {
      menu: 'Journal',
      currentPath: '/journal/portfolios',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);

export default router;
