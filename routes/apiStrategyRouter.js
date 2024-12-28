import { Router } from 'express';

import asyncMiddleware from '../config/asyncMiddleware.config.js';
const router = Router();
import { AuthenticationMiddleware } from '../config/ensureUserRole.config.js';
import { StrategyRepository } from '../repository/strategyRepository.js';

router.get(
  '/',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const userId = req.user._id;
    const strategies = await StrategyRepository.getAllStrategies(userId);
    res.sendJsonResponse(200, 'Success', strategies);
  })
);

router.post(
  '/',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name) {
      res.sendJsonResponse(404, 'Strategy name is required');
    }

    const newStrategy = {
      name,
      createdAt: new Date(),
    };
    await StrategyRepository.addStrategy(userId, newStrategy);
    res.sendJsonResponse(200, 'Strategy added successfully');
  })
);

router.put(
  '/:id',
  AuthenticationMiddleware.ensureLoggedInApi(),
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    if (!name) {
      res.sendJsonResponse(404, 'Strategy name is required');
    }

    const updatedStrategy = await StrategyRepository.updateStrategy(
      id,
      userId,
      {
        name,
        updatedAt: new Date(),
      }
    );
    if (!updatedStrategy) {
      res.sendJsonResponse(404, 'Strategy not found');
    }
    res.sendJsonResponse(200, 'Strategy updated successfully', updatedStrategy);
  })
);

export default router;
