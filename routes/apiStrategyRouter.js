import { Router } from 'express';

const router = Router();
import asyncMiddleware from '../config/asyncMiddleware.config.js';
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { strategyRepository } from '../repository/strategyRepository.js';

router.get(
  '/',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const strategies = await strategyRepository.getAllStrategies();
    res.sendJsonResponse(200, 'Success', strategies);
  })
);

router.post(
  '/add',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { name } = req.body;
    if (!name) {
      res.sendJsonResponse(404, 'Strategy name is required');
    }

    const newStrategy = {
      name,
      createdAt: new Date(),
    };
    await strategyRepository.addStrategy(newStrategy);
    res.sendJsonResponse(200, 'Strategy added successfully');
  })
);

// res.sendJsonResponse(200, 'Trade deleted successfully');

router.put(
  '/edit/:id',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.sendJsonResponse(404, 'Strategy name is required');
    }

    const updatedStrategy = await strategyRepository.updateStrategy(id, {
      name,
      updatedAt: new Date(),
    });
    if (!updatedStrategy) {
      res.sendJsonResponse(404, 'Strategy not found');
    }
    res.sendJsonResponse(200, 'Strategy updated successfully', updatedStrategy);
  })
);

export default router;
