import { Router } from 'express';
const router = Router();
import { tradeHistoryRepository } from '../repository/tradeHistoryRepository.js';
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import {
  AuthenticationMiddleware as auth,
  AuthenticationMiddleware,
} from '../config/ensureUserRole.config.js';

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
      res.sendJsonResponse(500, 'Failed to add trade.');
    }
  })
);

export default router;
