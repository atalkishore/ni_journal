import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { StrategyRepository } from '../repository/strategyRepository.js';
import { tradeRepository } from '../repository/tradeRepository.js';
import { seoHeadTagValues, PAGE_NAME, redirectTo404 } from '../utils/index.js';
import { ObjectId } from 'mongodb';
import { JournalGuestRepository } from '../repository/journalGuestRepository.js';

router.get(
  '/',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    if (req.user?.isAdmin) {
      return res.render('journal/Dashboard', {
        menu: 'Journal',
        currentPath: 'journal/dashboard',
        ...seoHeadTagValues(PAGE_NAME.JOURNAL_DASHBOARD),
      });
    }

    let userId = req.user.encKey;
    const name = req.user.name;
    const email = req.user.email;

    if (userId && name && email) {
      if (!ObjectId.isValid(userId)) {
        userId = new ObjectId();
      } else {
        userId = new ObjectId(userId);
      }
      await JournalGuestRepository.findOrCreateGuest(userId, name, email);
    }

    res.render('journal/dashboard_guest', {
      menu: 'Journal',
      currentPath: 'journal/dashboard',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_GUEST),
    });
  })
);

router.get(
  '/tradejournal',
  asyncMiddleware(async (req, res) => {
    res.render('journal/journal', {
      menu: 'Journal',
      currentPath: 'journal/journal',
      ...seoHeadTagValues(PAGE_NAME.TRADE_JOURNAL),
    });
  })
);

router.get(
  '/analyse',
  asyncMiddleware(async (req, res) => {
    res.render('journal/analyse', {
      menu: 'Journal',
      currentPath: '/journal/analyse',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_ANALYSE),
    });
  })
);

// get- localhost:5110/journal/addTrade

router.get(
  '/add-trade',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    const userId = req.user._id;
    const strategies = await StrategyRepository.getAllStrategies(userId);
    res.render('journal/addEditTrade', {
      menu: 'Journal',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_ADD_TRADE),
      strategies,
      trade: null,
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
    const strategies = await StrategyRepository.getAllStrategies(userId);

    return res.render('journal/addEditTrade', {
      menu: 'Journal',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_EDIT_TRADE),
      strategies,
      trade: tradeDetails,
    });
  })
);

// get- localhost:5110/journal/trades/11111

router.get(
  '/trades/:tradeid',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    try {
      const tradeId = req.params.tradeid;
      const userId = req.user?._id;

      if (!tradeId || tradeId.length !== 24 || !ObjectId.isValid(tradeId)) {
        res.sendJsonResponse(400, 'Invalid Trade  ID');
      }

      const tradeDetails = await tradeRepository.getTradeById(
        new ObjectId(tradeId),
        userId
      );

      if (!tradeDetails) {
        res.sendJsonResponse(404, 'Trade not found');
      }

      return res.render('journal/tradeDetails', {
        menu: 'Journal',
        tradeId,
        trade: tradeDetails,
        ...seoHeadTagValues(PAGE_NAME.JOURNAL_TRADE_DETAILS),
      });
    } catch (error) {
      res.sendJsonResponse(500, 'Internal server error');
    }
  })
);

// get- localhost:5110/journal/trades

router.get(
  '/trades',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) =>
    // const userId = req.user._id;

    // const trades = await tradeRepository.getTrades(userId);
    res.render('journal/executionList', {
      menu: 'Journal',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_EXECUTION_LIST),
      // trades,
    })
  )
);

router.get(
  '/manage-strategy',
  AuthenticationMiddleware.ensureLoggedIn(),
  asyncMiddleware(async (req, res) => {
    res.render('journal/manageStrategies', {
      menu: 'Journal',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_STRATEGY_LIST),
    });
  })
);

router.get(
  '/trade-history',
  AuthenticationMiddleware.ensureLoggedIn(),
  async (req, res) => {
    res.render('journal/tradeHistory', {
      menu: 'Journal',
      ...seoHeadTagValues(PAGE_NAME.JOURNAL_TRADE_HISTORY),
    });
  }
);

export default router;
