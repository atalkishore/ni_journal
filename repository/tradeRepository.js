import { baseRepository, connect } from './baseMongoDbRepository.js';
import { toObjectID } from '../utils/helpers.js';

const collectionName = '1_journal_trades';

export const tradeRepository = {
  async addTrade(trade, userId) {
    return await baseRepository.insertOne(collectionName, {
      ...trade,
      user_id: toObjectID(userId),
    });
  },

  async getTrades(userId, filters) {
    return await baseRepository.find(collectionName, {
      status: 'Active',
      user_id: toObjectID(userId),
      ...filters,
    });
  },

  async getTradeById(id, userId) {
    return await baseRepository.findOneById(collectionName, {
      _id: toObjectID(id),
      user_id: toObjectID(userId),
    });
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
  async getTradesBySymbolSinceDate(symbol, userId, startDate = null) {
    const filter = { status: 'Active', symbol, user_id: toObjectID(userId) };
    if (startDate) {
      filter.tradeDate = { $gte: startDate };
    }
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.find(filter).sort({ tradeDate: 1 }).toArray();
  },
  async updateTradeGroupId(tradeId, groupId) {
    await baseRepository.updateOneById(collectionName, tradeId, { groupId });
  },
};
