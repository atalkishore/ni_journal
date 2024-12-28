import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { TradeHistoryRepository } from '../repository/tradeHistoryRepository.js';

router.get(
  '/',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const userId = req.user._id;
      const tradeHistory = await TradeHistoryRepository.getGroupTrades(userId);

      res.sendJsonResponse(
        200,
        'Trade history fetched successfully',
        tradeHistory
      );
    } catch (error) {
      res.sendJsonResponse(500, 'Failed to add trade.');
    }
  })
);

export default router;
