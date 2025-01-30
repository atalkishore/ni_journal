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

  static async getDashboardSummary(userId) {
    try {
      const db = await connect();

      const now = moment().utcOffset(330); // Convert to IST
      const oneDayAgo = now.clone().subtract(1, 'days').startOf('day').toDate();
      const today = now.clone().startOf('day').toDate();
      const thirtyDaysAgo = now.clone().subtract(30, 'days').toDate();

      const lastDayTrades = await db
        .collection(collectionName)
        .find({
          userId: toObjectID(userId),
          status: { $ne: 'DELETED' },
          isOpen: false,
          $expr: {
            $and: [
              {
                $gte: [
                  { $dateFromString: { dateString: '$endDate' } },
                  new Date(oneDayAgo),
                ],
              },
              {
                $lt: [
                  { $dateFromString: { dateString: '$endDate' } },
                  new Date(today),
                ],
              },
            ],
          },
        })
        .toArray();

      let lastDayPnL = 0;
      lastDayTrades.forEach((trade) => {
        const buyPrice = parseFloat(trade.buyAvg) || 0;
        const sellPrice = parseFloat(trade.sellAvg) || 0;
        const qty = parseInt(trade.sellQty) || 0;

        lastDayPnL += (sellPrice - buyPrice) * qty;
      });

      const pnlEvolutionPipeline = [
        {
          $match: {
            userId: toObjectID(userId),
            status: { $ne: 'DELETED' },
            endDate: {
              $gte: { $dateFromString: { dateString: thirtyDaysAgo } },
            },
            isOpen: false,
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: { $dateFromString: { dateString: '$endDate' } },
                },
              },
            },
            dailyPnL: {
              $sum: {
                $multiply: [
                  {
                    $subtract: [
                      { $toDouble: '$sellAvg' },
                      { $toDouble: '$buyAvg' },
                    ],
                  },
                  { $toInt: '$sellQty' },
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

      const pnlEvolution = { dates: [], dailyPnL: [], totalPnL: [] };
      let totalPnL = 0;
      pnlEvolutionData.forEach((day) => {
        pnlEvolution.dates.push(day._id.date);
        pnlEvolution.dailyPnL.push(day.dailyPnL);
        totalPnL += day.dailyPnL;
        pnlEvolution.totalPnL.push(totalPnL);
      });

      return {
        lastDayPnL: lastDayPnL.toFixed(2),
        totalPnL: totalPnL.toFixed(2),
        pnlEvolution,
      };
    } catch (error) {
      throw new Error('Error calculating dashboard summary');
    }
  }
}

export { TradeHistoryRepository };
