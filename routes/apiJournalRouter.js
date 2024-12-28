import { Router } from 'express';
import Joi from 'joi';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { LOGGER } from '../config/winston-logger.config.js';
import { tradeRepository } from '../repository/tradeRepository.js';
import { TradingJournalService } from '../service/tradeGroupService.js';

const tradeSchema = Joi.object({
  tradeDate: Joi.string().isoDate().required().messages({
    'any.required': 'Trade date is required.',
    'string.isoDate': 'Invalid trade date format.',
  }),
  instrument: Joi.string()
    .valid('Stock', 'Option', 'Futures')
    .required()
    .messages({
      'any.required': 'Instrument is required.',
      'any.only': 'Instrument must be one of Stock, Option, or Futures.',
    }),
  symbol: Joi.string().trim().required().messages({
    'any.required': 'Symbol is required.',
    'string.empty': 'Symbol cannot be empty.',
  }),
  position: Joi.string().valid('Buy', 'Sell').required().messages({
    'any.required': 'Position is required.',
    'any.only': 'Position must be either Buy or Sell.',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Quantity is required.',
    'number.min': 'Quantity must be at least 1.',
  }),
  entryPrice: Joi.number().positive().required().messages({
    'any.required': 'Entry price is required.',
    'number.positive': 'Entry price must be greater than 0.',
  }),
  targetPrice: Joi.number().positive().allow(null, 0).messages({
    'number.positive': 'Target price must be greater than 0.',
  }),
  stopLoss: Joi.number().positive().allow(null, 0).messages({
    'number.positive': 'Stop loss must be greater than 0.',
  }),
  strategy: Joi.string().trim().required().messages({
    'any.required': 'Strategy is required.',
    'string.empty': 'Strategy cannot be empty.',
  }),
  account: Joi.string().trim().allow(null, '').messages({
    'string.empty': 'Account cannot be empty.',
  }),
  transactionCost: Joi.number().positive().allow(null, 0).messages({
    'number.positive': 'Transaction cost must be greater than 0.',
  }),
  tradeNotes: Joi.string().trim().allow(null, '').messages({
    'string.empty': 'Trade notes cannot be empty.',
  }),
  tags: Joi.array().items(Joi.string().trim().max(20)).max(5).messages({
    'array.max': 'You can add a maximum of 5 tags.',
    'string.max': 'Each tag must be at most 20 characters long.',
  }),
});

// post- localhost:5110/api/journal/addTrade
router.post(
  '/trades',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const userId = req.user._id;
      const trade = req.body;
      const { error } = tradeSchema.validate(trade, { abortEarly: false });

      if (error) {
        return res.status(400).json({
          status: 'Failure',
          message: 'Validation errors',
          errors: error.details.map((err) => err.message),
        });
      }

      await TradingJournalService.addTrade(trade, userId);

      res.sendJsonResponse(200, 'Trade added successfully');
    } catch (error) {
      LOGGER.info(error);
      throw error;
      // res.sendJsonResponse(500, 'Failed to add trade.');
    }
  })
);

function extractFilters(query) {
  const { symbol, startDate, endDate, position, status, groupId } = query;

  const filters = {};
  if (symbol) {
    filters.symbol = symbol;
  }
  if (startDate) {
    filters.startDate = new Date(startDate);
  }
  if (endDate) {
    filters.endDate = new Date(endDate);
  }
  if (position) {
    filters.position = position;
  } // e.g., 'Buy' or 'Sell'
  if (status) {
    filters.status = status;
  } // e.g., 'Active', 'Closed'
  if (groupId) {
    filters.groupId = groupId;
  }

  return filters;
}
router.get(
  '/trades',
  AuthenticationMiddleware.ensureLoggedInApi(),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const filters = extractFilters(req.query);
      const trades = await tradeRepository.getTrades(userId, filters);
      res.sendJsonResponse(200, 'Trade fetched successfully', trades);
    } catch (error) {
      res.sendJsonResponse(500, 'Failed to fetch trades.');
    }
  }
);

// localhost:5110/api/journal/deleteTrade
router.delete('/trades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tradeRepository.deleteTrade(id);

    if (result.modifiedCount > 0) {
      res.sendJsonResponse(200, 'Trade deleted successfully');
      // res.status(200).json({ message: 'Trade deleted successfully' });
    } else {
      res.sendJsonResponse(400, 'Trade not found');
      // res.status(404).json({ message: 'Trade not found' });
    }
  } catch (error) {
    res.sendJsonResponse(500, 'Failed to delete trade');
    // res.status(500).json({ message: 'Failed to delete trade' });
  }
});

router.get('/trades/:tradeid', async (req, res) => {
  try {
    const trade = await tradeRepository.getTradeById(req.params.id);
    if (!trade) {
      res.sendJsonResponse(400, 'Trade not found');
      // return res.status(404).json({ message: 'Trade not found' });
    }
    res.sendJsonResponse(200, 'Trade fetched successfully', trade);
    // res.json(trade);
  } catch (err) {
    res.sendJsonResponse(500, 'Server Error', { error: err.message });
    // res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

router.put('/trades/:tradeid', async (req, res) => {
  const userId = req.user._id;
  const { tradeId } = req.params;
  const updatedData = req.body;
  const { error } = tradeSchema.validate(updatedData, { abortEarly: false });

  if (error) {
    return res.sendJsonResponse(400, 'Validation errors', {
      errors: error.details.map((err) => err.message),
    });
  }
  const existingTrade = await TradingJournalService.getTrade(tradeId, userId);
  if (!existingTrade) {
    res.sendJsonResponse(400, 'Trade not found or no changes applied');
  }
  await TradingJournalService.editTrade(
    tradeId,
    existingTrade,
    updatedData,
    userId
  );
  res.sendJsonResponse(200, 'Trade fetched successfully');
});

export default router;
