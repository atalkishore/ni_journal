import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { TradeHistoryRepository } from '../repository/tradeHistoryRepository.js';

function extractFilters(query) {
  const { symbol, startDate, endDate, position, status, groupId } = query;

  const filters = {};
  if (symbol) {
    filters.symbol = symbol;
  }
  if (startDate) {
    filters.startDate = { $gte: new Date(startDate) };
  }
  if (endDate) {
    filters.endDate = { $lte: new Date(endDate) };
  }
  if (position) {
    filters.position = position;
  }
  if (status) {
    filters.status = status;
  }
  if (groupId) {
    filters.groupId = groupId;
  }

  return filters;
}

router.get(
  '/',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const userId = req.user._id;
      const filters = extractFilters(req.query);

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 4;
      const skip = (page - 1) * limit;

      const totalHistoryCount = await TradeHistoryRepository.countTradeHistory(
        userId,
        filters
      );

      const tradeHistory =
        await TradeHistoryRepository.getPaginatedTradeHistory(
          userId,
          filters,
          skip,
          limit
        );

      const totalPages = Math.ceil(totalHistoryCount / limit);

      res.sendJsonResponse(200, 'Trade history fetched successfully', {
        trades: tradeHistory,
        currentPage: page,
        totalPages,
        totalHistoryCount,
      });
    } catch (error) {
      res.sendJsonResponse(500, 'Failed to fetch trade history.');
    }
  })
);

export default router;
