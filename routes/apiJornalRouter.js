import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware as auth } from '../config/ensureUserRole.config.js';
import { LOGGER } from '../config/winston-logger.config.js';
import { getAuditLogs } from '../repository/logRepository.js';

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

export default router;
