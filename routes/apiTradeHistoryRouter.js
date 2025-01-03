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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 4;

      const tradeHistory = await TradeHistoryRepository.getGroupTrades(userId);

      res.sendJsonResponse(
        200,
        'Trade history fetched successfully',
        tradeHistory
      );

      const { trades, totalCount } =
        await TradeHistoryRepository.getPaginatedTrades(userId, page, limit);

      const totalPages = Math.ceil(totalCount / limit);
      res.sendJsonResponse(200, 'Trade history fetched successfully', {
        trades,
        totalPages,
      });
    } catch (error) {
      res.sendJsonResponse(500, 'Failed to fetch trade history.');
    }
  })
);

export default router;
