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
      if (!req.user) {
        return res.sendJsonResponse(401, 'Unauthorized: User not logged in');
      }

      const userId = req.user._id;

      if (!userId) {
        return res.sendJsonResponse(400, 'User ID is required');
      }

      const summary = await TradeHistoryRepository.getDashboardSummary(userId);

      if (!summary) {
        return res.sendJsonResponse(404, 'Dashboard summary not found');
      }

      summary.totalPnLFormatted = `₹ ${summary.totalPnL}`;

      return res.sendJsonResponse(
        200,
        'Dashboard summary fetched successfully',
        summary
      );
    } catch (error) {
      return res.sendJsonResponse(500, `Server Error: ${error.message}`);
    }
  })
);

export default apiDashboardRouter;
