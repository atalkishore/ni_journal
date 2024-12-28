import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { tradeRepository } from '../repository/tradeRepository.js';
import { seoHeadTagValues, PAGE_NAME, redirectTo404 } from '../utils/index.js';

router.get(
  '/',
  asyncMiddleware(async (req, res) => {
    res.render('journal/Dashboard', {
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

router.get(
  '/add-trade',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    res.render('journal/addTrade', {
      menu: 'Journal',
      currentPath: '/journal/addTrade',
      title: 'Add Trade - Nifty Invest',
      description: 'Easily add your trades.',
      keywords: 'add trade, investments, stock journal, nifty invest',
      CANONICAL_URL: 'https://niftyinvest.com/journal/addTrade',
    });
  })
);

// get- localhost:5110/journal/trades/11111
router.get(
  '/trades/:tradeid/edit',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    const tradeId = req.params.tradeid;
    const userId = req.user._id;

    const tradeDetails = await tradeRepository.getTradeById(tradeId, userId);
    if (!tradeDetails) {
      return redirectTo404(res);
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
  })
);

// get- localhost:5110/journal/trades/11111
router.get(
  '/trades/:tradeid',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    const tradeId = req.params.tradeid?.toLowerCase();
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
      tradeId,
      currentPath: `/journal/trades/${tradeId}`,
      title: 'Trade Details - Nifty Invest',
      description: 'View trade details.',
      keywords: 'trade details, investments, stock journal, nifty invest',
      CANONICAL_URL: `https://niftyinvest.com/journal/tradeDetails/${tradeId}`,
      trade: tradeDetails,
    });
  })
);

// get- localhost:5110/journal/trades

router.get(
  '/trades',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    try {
      const userId = req.user._id;

      const trades = await tradeRepository.getTrades(userId);
      return res.render('journal/executionList', {
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
  })
);

router.get(
  '/manage-strategy',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    res.render('journal/manageStrategies', {
      menu: 'Journal',
      currentPath: '/journal/manageStrategies',
      title: 'Add Trade - Nifty Invest',
      description: 'Easily add your trades.',
      keywords: 'add trade, investments, stock journal, nifty invest',
      CANONICAL_URL: 'https://niftyinvest.com/journal/addTrade',
    });
  })
);

router.get(
  '/trade-history',
  AuthenticationMiddleware.ensureLoggedIn(),
  async (req, res) => {
    res.render('journal/tradeHistory', {
      menu: 'Journal',
      currentPath: '/journal/trade-history',
      title: 'Trade  - Nifty Invest',
      description: 'Easily add your trades.',
      keywords: 'Trade History, investments, stock journal, nifty invest',
      CANONICAL_URL: 'https://niftyinvest.com/journal/tradeHistory',
    });
  }
);

export default router;
