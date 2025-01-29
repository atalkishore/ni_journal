import { TradeHistoryRepository } from '../repository/tradeHistoryRepository.js';
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { Router } from 'express';

const apiDashboardRouter = Router();

apiDashboardRouter.get(
  '/dashboard',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const userId = req.user._id;
      const summary = await TradeHistoryRepository.getDashboardSummary(userId);

      res.sendJsonResponse(
        200,
        'Dashboard summary fetched successfully',
        summary
      );
    } catch (error) {
      res.sendJsonResponse(500, 'Server Error');
    }
  })
);

export default apiDashboardRouter;
