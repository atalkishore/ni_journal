import { Router } from 'express';
import Joi from 'joi';
const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import {
  AuthenticationMiddleware as auth,
  AuthenticationMiddleware,
} from '../config/ensureUserRole.config.js';
import { LOGGER } from '../config/winston-logger.config.js';
import { strategyRepository } from '../repository/strategyRepository.js';
import { tradeRepository } from '../repository/tradeRepository.js';

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
  '/addTrade',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const { error } = tradeSchema.validate(req.body, { abortEarly: false });

      if (error) {
        return res.status(400).json({
          status: 'Failure',
          message: 'Validation errors',
          errors: error.details.map((err) => err.message),
        });
      }

      const userId = req.user._id;
      const trade = req.body;

      await tradeRepository.addTrade(
        {
          ...trade,
          status: 'Active',
        },
        userId
      );

      res
        .status(200)
        .json({ status: 'Success', message: 'Trade added successfully.' });
    } catch (error) {
      res
        .status(500)
        .json({ status: 'Failure', message: 'Failed to add trade.' });
    }
  })
);
// localhost:5110/api/journal/trades
router.get(
  '/trades',
  AuthenticationMiddleware.ensureLoggedInApi(),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const trades = await tradeRepository.getTrades(userId);
      res.status(200).json(trades);
    } catch (error) {
      res
        .status(500)
        .json({ status: 'Failure', message: 'Failed to fetch trades.' });
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

router.put('/updateTrade/:tradeId', async (req, res) => {
  try {
    const { tradeId } = req.params;
    const updatedData = req.body;

    const result = await tradeRepository.updateTrade(tradeId, updatedData);

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trade not found or no changes applied.',
      });
    }

    res.json({ message: 'Trade updated successfully' });
  } catch (error) {
    LOGGER.error('Error updating trade:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to update trade.' });
  }
});

router.get('/strategies', async (req, res) => {
  try {
    const strategies = await strategyRepository.getAllStrategies();
    res.json(strategies);
  } catch (error) {
    res.status(500).send('Failed to fetch strategies');
  }
});

router.post('/addStrategy', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.sendJsonResponse(404, 'Strategy name is required');
  }

  try {
    const newStrategy = {
      name,
      createdAt: new Date(),
    };
    await strategyRepository.addStrategy(newStrategy);
    res.sendJsonResponse(200, 'Strategy added successfully');
  } catch (error) {
    res.sendJsonResponse(500, 'Failed to add strategy successfully');
  }
});

// res.sendJsonResponse(200, 'Trade deleted successfully');

router.put('/editStrategy/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    res.sendJsonResponse(404, 'Strategy name is required');
  }

  try {
    const updatedStrategy = await strategyRepository.updateStrategy(id, {
      name,
      updatedAt: new Date(),
    });
    if (!updatedStrategy) {
      res.sendJsonResponse(404, 'Strategy not found');
    }
    res.status(200).json(updatedStrategy);
  } catch (err) {
    res.sendJsonResponse(500, 'Failed to update Strategy', {
      error: err.message,
    });
  }
});

// res.sendJsonResponse(200, 'Trade deleted successfully');

export default router;
