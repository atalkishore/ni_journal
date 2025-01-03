import moment from 'moment-timezone';
import { nanoid } from 'nanoid';

import { baseRepository, connect } from './baseMongoDbRepository.js';
import { toObjectID } from '../utils/helpers.js';

const collectionName = 'journal_tradeHistory';

class TradeHistoryRepository {
  static async getTradeHistoryByGroupId(groupId) {
    return await baseRepository.findOne(collectionName, { groupId });
  }
  static async markGroupAsDeleted(groupId) {
    await baseRepository.updateOne(
      collectionName,
      { groupId },
      {
        status: 'DELETED',
        expires_at: moment().utcOffset(330).add(7, 'days').toDate(),
      }
    );
  }
  static async getGroupTrades(userId) {
    return await baseRepository.find(
      collectionName,
      {
        status: { $ne: 'DELETED' },
        userId: toObjectID(userId),
      },
      { sort: { endDate: -1 } }
    );
  }

  static async getPaginatedTrades(userId, page, limit) {
    const db = await connect();
    const skip = (page - 1) * limit;

    const trades = await db
      .collection(collectionName)
      .find({
        status: { $ne: 'DELETED' },
        userId: toObjectID(userId),
      })
      .sort({ endDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalCount = await db.collection(collectionName).countDocuments({
      status: { $ne: 'DELETED' },
      userId: toObjectID(userId),
    });

    return { trades, totalCount };
  }

  static async createGroup(
    userId,
    symbol,
    trades,
    buyQty,
    sellQty,
    buyAvg,
    sellAvg,
    isOpen = true
  ) {
    const groupId = nanoid();
    const group = {
      groupId,
      userId: toObjectID(userId),
      symbol,
      startDate: trades[0].tradeDate,
      endDate: trades[trades.length - 1].tradeDate,
      position: trades[0].position,
      buyQty,
      sellQty,
      buyAvg,
      sellAvg,
      trades: trades.map((t) => t._id),
      isOpen,
      status: 'ACTIVE',
    };
    await baseRepository.insertOne(collectionName, group);
    return groupId;
  }

  static async findFirstAffectedGroupBySymbol(symbol, userId, tradeDate) {
    try {
      const db = await connect();
      const affectedGroup = await db.collection(collectionName).findOne({
        symbol,
        userId: toObjectID(userId),
        status: 'ACTIVE',
        $or: [
          { startDate: { $lte: tradeDate }, endDate: { $gte: tradeDate } },
          { startDate: { $gte: tradeDate }, endDate: { $lte: tradeDate } },
        ],
      });
      return affectedGroup;
    } catch (error) {
      throw new Error('Failed to find affected group');
    }
  }
}

export { TradeHistoryRepository };
