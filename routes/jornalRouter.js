import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { PAGE_NAME } from '../utils/constants.js';
import { seoHeadTagValues } from '../utils/index.js';

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
router.get(
  '/addTrade',
  asyncMiddleware(async (req, res) => {
    res.render('journal/addTrade', {
      menu: 'Journal',
      currentPath: '/journal/add',
      ...seoHeadTagValues(PAGE_NAME.HOME),
    });
  })
);
router.get(
  '/trades',
  asyncMiddleware(async (req, res) => {
    res.render('journal/tradeList', {
      menu: 'Journal',
      currentPath: '/journal/trades',
      ...seoHeadTagValues(PAGE_NAME.HOME),
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
