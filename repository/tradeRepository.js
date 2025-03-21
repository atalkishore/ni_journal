import { baseRepository, connect } from './baseMongoDbRepository.js';
import { toObjectID } from '../utils/helpers.js';

const collectionName = 'journal_trades';

export const tradeRepository = {
  async addTrade(trade, userId) {
    return await baseRepository.insertOne(collectionName, {
      ...trade,
      userId: toObjectID(userId),
    });
  },

  async getTrades(userId, filters) {
    return await baseRepository.find(
      collectionName,
      {
        status: 'Active',
        userId: toObjectID(userId),
        ...filters,
      },
      { sort: { tradeDate: -1 } }
    );
  },

  async countTrades(userId, filters) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.countDocuments({
      status: 'Active',
      userId: toObjectID(userId),
      ...filters,
    });
  },

  async getPaginatedTrades(userId, filters, skip, limit) {
    const query = {
      status: 'Active',
      userId: toObjectID(userId),
    };

    if (filters.startDate || filters.endDate) {
      query.tradeDate = {};
      if (filters.startDate) {
        query.tradeDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.tradeDate.$lte = new Date(filters.endDate);
      }
    }

    return await baseRepository.find(collectionName, query, {
      sort: { tradeDate: -1 },
      skip,
      limit,
    });
  },

  async getTradeById(id, userId) {
    const trade = await baseRepository.findOne(collectionName, {
      _id: toObjectID(id),
      userId: toObjectID(userId),
    });

    if (!trade) return null;

    if (trade.strategy) {
      const strategy = await baseRepository.findOne('journal_strategies', {
        _id: toObjectID(trade.strategy),
      });

      trade.strategy = strategy ? strategy.name : 'Unknown Strategy';
    }

    return trade;
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
    const filter = { status: 'Active', symbol, userId: toObjectID(userId) };
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
