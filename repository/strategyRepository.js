import { baseRepository } from './baseMongoDbRepository.js';
import { toObjectID } from '../utils/helpers.js';

const collectionName = 'journal_strategies';

class StrategyRepository {
  async addStrategy(userId, strategy) {
    return await baseRepository.insertOne(collectionName, {
      userId: toObjectID(userId),
      ...strategy,
    });
  }

  async getAllStrategies(userId) {
    return await baseRepository.find(collectionName, {
      userId: toObjectID(userId),
    });
  }

  async updateStrategy(id, userId, updateData) {
    return await baseRepository.updateOne(
      collectionName,
      {
        _id: toObjectID(id),
        userId: toObjectID(userId),
      },
      updateData,
      { new: true }
    );
  }
}

// Export the singleton instance of the class
const strategyRepositoryInstance = new StrategyRepository();
export { strategyRepositoryInstance as StrategyRepository };
