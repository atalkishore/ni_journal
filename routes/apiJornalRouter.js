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
    await tradeRepository.addTrade({ ...trade, status: 'Active' }); // Default status
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
  const { id } = req.params;
  try {
    await tradeRepository.deleteTrade(id);
    res
      .status(200)
      .json({ status: 'Success', message: 'Trade deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'Failure', message: 'Failed to delete trade' });
  }
});

export default router;
