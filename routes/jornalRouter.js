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

router.get(
  '/trades',
  asyncMiddleware(async (req, res) => {
    try {
      const trades = await tradeRepository.getTrades();
      res.render('journal/tradeList', {
        menu: 'Journal',
        currentPath: '/journal/trades',
        title: 'Add Trade - Nifty Invest',
        description: 'Easily add your trades.',
        keywords: 'add trade, investments, stock journal, nifty invest',
        CANONICAL_URL: 'https://niftyinvest.com/journal/addTrade',
        trades,
      });
    } catch (error) {
      res.status(500).render('error', {
        status: 'Failure',
        message: 'Failed to fetch trades.',
        data: null,
      });
    }
  })
);

export default router;
