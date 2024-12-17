import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware as auth } from '../config/ensureUserRole.config.js';
import { LOGGER } from '../config/winston-logger.config.js';
import { getAuditLogs } from '../repository/logRepository.js';
import { tradeRepository } from '../repository/tradeRepository.js';

router.get(
  '/audit-logs',
  auth.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const { resourceType, resourceId, action } = req.query;

      // Validate mandatory parameters
      if (!resourceType || !resourceId) {
        return res
          .status(400)
          .json({ error: 'resourceType and resourceId are required' });
      }

      // Fetch audit logs from the controller
      const logs = await getAuditLogs(resourceType, resourceId, action);

      // Return the result
      res.status(200).json(logs);
    } catch (error) {
      LOGGER.error('Error fetching audit logs:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while fetching audit logs.' });
    }
  })
);

router.get(
  '/test-api-login',
  auth.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    try {
      const data = {
        status: 'ok',
        message: 'your test api is working with login',
      };
      // Return the result
      res.status(200).json(data);
    } catch (error) {
      LOGGER.error('Error fetching audit logs:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while fetching audit logs.' });
    }
  })
);

router.get(
  '/test-api',
  asyncMiddleware(async (req, res) => {
    try {
      const data = {
        status: 'ok',
        message: 'your test api is working without login',
      };
      res.status(200).json(data);
    } catch (error) {
      LOGGER.error('Error fetching audit logs:', error);
      res
        .status(500)
        .json({ message: 'An error occurred while fetching audit logs.' });
    }
  })
);

// post- localhost:5110/api/journal/addTrade

router.post('/addTrade', async (req, res) => {
  try {
    const trade = req.body;
    await tradeRepository.addTrade({ ...trade, status: 'Active' });
    res
      .status(200)
      .json({ status: 'Success', message: 'Trade added successfully.' });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'Failure', message: 'Failed to add trade.' });
  }
});
// localhost:5110/api/journal/trades
router.get('/trades', async (req, res) => {
  try {
    const trades = await tradeRepository.getTrades();
    res.status(200).json(trades);
  } catch (error) {
    res
      .status(500)
      .json({ status: 'Failure', message: 'Failed to fetch trades.' });
  }
});

// localhost:5110/api/journal/deleteTrade
router.delete('/deleteTrade/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tradeRepository.deleteTrade(id);

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'Trade deleted successfully' });
    } else {
      res.status(404).json({ message: 'Trade not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete trade' });
  }
});

router.get('/tradeDetails/:tradeId', async (req, res) => {
  const { tradeId } = req.params;
  try {
    const trade = await tradeRepository.getTradeById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found.' });
    }
    return res.status(200).json(trade);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch trade details.' });
  }
});

router.get('/trades/:id', async (req, res) => {
  try {
    const trade = await tradeRepository.getTradeById(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    res.json(trade);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
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

export default router;
