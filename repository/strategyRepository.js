import { baseRepository } from './baseMongoDbRepository.js';

const collectionName = 'journal_strategies';

export const strategyRepository = {
  async addStrategy(strategy) {
    return await baseRepository.insertOne(collectionName, strategy);
  },

  async getAllStrategies() {
    return await baseRepository.find(collectionName, {});
  },

  async updateStrategy(id, updateData) {
    return await baseRepository.updateOneById(collectionName, id, updateData, {
      new: true,
    });
  },
};
