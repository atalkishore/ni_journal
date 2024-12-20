import { baseRepository } from './baseMongoDbRepository.js';
import { toObjectID } from '../utils/helpers.js';

const collectionName = 'journal_trades';

export const tradeRepository = {
  async addTrade(trade, userId) {
    return await baseRepository.insertOne(collectionName, {
      ...trade,
      user_id: toObjectID(userId),
    });
  },

  async getTrades(userId) {
    return await baseRepository.find(collectionName, {
      status: 'Active',
      user_id: toObjectID(userId),
    });
  },

  async getTradeById(id) {
    return await baseRepository.findOneById(collectionName, id);
  },

  async updateTrade(id, updateData) {
    return await baseRepository.updateOneById(collectionName, id, updateData, {
      new: true,
    });
  },

  async deleteTrade(id) {
    return await baseRepository.updateOneById(collectionName, id, {
      status: 'Deleted',
    });
  },
};
