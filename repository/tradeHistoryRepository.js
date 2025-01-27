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

  static async countTradeHistory(userId, filters) {
    const db = await connect();
    const query = {
      status: { $ne: 'DELETED' },
      userId: toObjectID(userId),
      ...filters,
    };
    return await db.collection(collectionName).countDocuments(query);
  }

  static async getPaginatedTradeHistory(userId, filters, skip, limit) {
    const db = await connect();
    const query = {
      status: { $ne: 'DELETED' },
      userId: toObjectID(userId),
      ...filters,
    };

    const trades = await db
      .collection(collectionName)
      .find(query)
      .sort({ endDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return trades;
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

  static async getLastDayPnL(userId) {
    const db = await connect();
    try {
      const latestTrade = await db
        .collection(collectionName)
        .find({
          status: { $ne: 'DELETED' },
          userId: toObjectID(userId),
        })
        .sort({ endDate: -1 })
        .limit(1)
        .toArray();

      if (latestTrade.length === 0) {
        return 0;
      }

      const lastTrade = latestTrade[0].trades[latestTrade[0].trades.length - 1];

      if (lastTrade.buyPrice && lastTrade.sellPrice) {
        const pnl = lastTrade.sellPrice - lastTrade.buyPrice;
        return pnl;
      }

      return 0;
    } catch (error) {
      throw new Error('Failed to calculate last day PnL');
    }
  }

  static async getDashboardSummary(userId) {
    try {
      const db = await connect();
      const now = moment().utcOffset(330);
      const oneDayAgo = now.clone().subtract(1, 'days').toDate();
      const thirtyDaysAgo = now.clone().subtract(30, 'days').toDate();

      const lastDayTrades = await db
        .collection(collectionName)
        .find({
          userId: toObjectID(userId),
          status: { $ne: 'DELETED' },
          tradeDate: { $gte: oneDayAgo },
        })
        .toArray();

      let lastDayPnL = 0;
      lastDayTrades.forEach((trade) => {
        if (trade.sellPrice && trade.buyPrice && trade.quantity) {
          lastDayPnL += (trade.sellPrice - trade.buyPrice) * trade.quantity;
        }
      });

      const pnlEvolutionPipeline = [
        {
          $match: {
            userId: toObjectID(userId),
            status: { $ne: 'DELETED' },
            tradeDate: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: '%Y-%m-%d', date: '$tradeDate' },
              },
            },
            dailyPnL: {
              $sum: {
                $multiply: [
                  { $subtract: ['$sellPrice', '$buyPrice'] },
                  '$quantity',
                ],
              },
            },
          },
        },
        { $sort: { '_id.date': 1 } },
      ];

      const pnlEvolutionData = await db
        .collection(collectionName)
        .aggregate(pnlEvolutionPipeline)
        .toArray();

      const pnlEvolution = {
        dates: [],
        dailyPnL: [],
        totalPnL: [],
      };

      let totalPnL = 0;
      pnlEvolutionData.forEach((day) => {
        pnlEvolution.dates.push(day._id.date);
        pnlEvolution.dailyPnL.push(day.dailyPnL);
        totalPnL += day.dailyPnL;
        pnlEvolution.totalPnL.push(totalPnL);
      });

      return {
        lastDayPnL,
        pnlEvolution,
      };
    } catch (error) {
      throw new Error('Error calculating dashboard summary');
    }
  }
}

export { TradeHistoryRepository };
