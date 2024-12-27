import { baseRepository } from './baseMongoDbRepository.js';
import { toObjectID } from '../utils/helpers.js';

const collectionName = 'journal_tradeHistory';

export const tradeHistoryRepository = {
  async addTradeHistory(tradeHistory, userId) {
    const openGroup = await this.getOpenTradeGroups(tradeHistory.symbol);

    if (openGroup.length > 0) {
      const groupId = openGroup[0].group_id;
      tradeHistory.group_id = groupId;
    } else {
      tradeHistory.group_id = `GRP-${new Date().getTime()}`;
    }

    tradeHistory.status = 'Open';
    tradeHistory.user_id = toObjectID(userId);

    return await baseRepository.insertOne(collectionName, tradeHistory);
  },

  async getTradeHistories(userId) {
    return await baseRepository.find(collectionName, {
      status: { $ne: 'Deleted' },
      user_id: toObjectID(userId),
    });
  },

  async getTradeHistoryById(id) {
    return await baseRepository.findOneById(collectionName, id);
  },

  async updateTradeHistory(id, updateData) {
    return await baseRepository.updateOneById(collectionName, id, updateData, {
      new: true,
    });
  },

  async deleteTradeHistory(id) {
    return await baseRepository.updateOneById(collectionName, id, {
      status: 'Deleted',
    });
  },

  async closeTradeGroup(groupId) {
    return await baseRepository.updateMany(
      collectionName,
      {
        group_id: groupId,
      },
      {
        status: 'Closed',
        close_date: new Date(),
      }
    );
  },

  async getOpenTradeGroups(symbol) {
    return await baseRepository.find(collectionName, {
      symbol: symbol,
      status: 'Open',
    });
  },

  async addOrUpdateTradeGroup(groupId, tradeData) {
    return await baseRepository.updateOne(
      collectionName,
      { group_id: groupId },
      { $push: { trades: tradeData } },
      { upsert: true }
    );
  },
};
