import { Router } from 'express';
const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { tradeHistoryRepository } from '../repository/tradeHistoryRepository.js';

router.get(
  '/getTradeHistory',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const userId = req.user._id;
      const tradeHistory =
        await tradeHistoryRepository.getTradeHistories(userId);

      res.status(200).json({
        status: 'Success',
        message: 'Trade history fetched successfully',
        data: tradeHistory,
      });
    } catch (error) {
      console.error('Error fetching trade history:', error);
      res.status(500).json({
        status: 'Failure',
        message: 'Failed to fetch trade history',
      });
    }
  })
);

export default router;
