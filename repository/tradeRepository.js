import { baseRepository } from './baseMongoDbRepository.js';

const collectionName = 'trades';

const tradeRepository = {
  async addTrade(trade) {
    return await baseRepository.insertOne(collectionName, trade);
  },

  async getTrades() {
    return await baseRepository.find(collectionName, { status: 'Active' });
  },

  async getTradeById(id) {
    return await baseRepository.findOneById(collectionName, id);
  },

  async updateTrade(id, updateData) {
    return await baseRepository.updateOneById(collectionName, id, updateData);
  },

  async deleteTrade(id) {
    return await baseRepository.updateOneById(collectionName, id, {
      status: 'Deleted',
    });
  },
};

export { tradeRepository };
