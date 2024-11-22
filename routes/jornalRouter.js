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
    description: 'Easily add your trades.',
    keywords: 'add trade, investments, stock journal, nifty invest',
    CANONICAL_URL: 'https://niftyinvest.com/journal/addTrade',
  });
});

router.post('/addTrade', async (req, res) => {
  try {
    const { stockName, price, stockType } = req.body;

    if (!stockName || !price || !stockType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const trade = { stockName, price: parseFloat(price), stockType };
    const result = await tradeRepository.addTrade(trade);

    res.status(200).json({ message: 'Trade added successfully', data: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add trade' });
  }
});

router.get(
  '/trades',
  asyncMiddleware(async (req, res) => {
    const trades = await tradeRepository.getTrades();
    res.render('journal/tradeList', {
      menu: 'Journal',
      trades,
      currentPath: '/journal/trades',
      title: 'Trade List - Nifty Invest',
      description: 'View and manage your trade history.',
      keywords: 'trade list, investments, stock journal, nifty invest',
      CANONICAL_URL: 'https://niftyinvest.com/journal/trades',
    });
  })
);
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
