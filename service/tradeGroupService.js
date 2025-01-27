import { TradeHistoryRepository } from '../repository/tradeHistoryRepository.js';
import { tradeRepository } from '../repository/tradeRepository.js';

class TradingJournalService {
  static async addTrade(trade, userId) {
    await tradeRepository.addTrade({ ...trade, status: 'Active' }, userId);
    await this.rebalanceTrades(userId, trade);
  }

  static async getTrade(tradeId, userId) {
    const existingTrade = await tradeRepository.getTradeById(tradeId, userId);

    return existingTrade;
  }
  static async editTrade(tradeId, existingTrade, updatedTrade, userId) {
    // Update the trade details
    await tradeRepository.updateTrade(tradeId, {
      ...existingTrade,
      ...updatedTrade,
    });

    // Rebalance trades for the updated symbol
    if (existingTrade.symbol !== updatedTrade.symbol) {
      await this.rebalanceTrades(userId, existingTrade);
    }

    await this.rebalanceTrades(userId, updatedTrade);
  }

  static async rebalanceTrades(userId, trade) {
    const symbol = trade.symbol;

    // Step 1: Find the first affected group using a direct query
    const affectedGroup =
      await TradeHistoryRepository.findFirstAffectedGroupBySymbol(
        symbol,
        userId,
        trade.tradeDate
      );

    // Step 2: Fetch only relevant trades since the affected group's start date
    const affectedTrades = await tradeRepository.getTradesBySymbolSinceDate(
      symbol,
      userId,
      affectedGroup?.startDate
    );

    // Step 3: Initialize variables for processing
    let cumulativeQty = 0;
    let currentGroup = [];
    const orphanedGroups = new Set();

    // Step 4: Traverse through the affected trades and rebalance them
    for (const trade of affectedTrades) {
      cumulativeQty +=
        trade.position === 'Buy' ? trade.quantity : -trade.quantity;
      currentGroup.push(trade);

      if (trade.groupId) {
        orphanedGroups.add(trade.groupId);
      }

      if (cumulativeQty === 0) {
        // Create a closed group
        await this._processGroup(currentGroup, symbol, userId, false); // Group is now closed
        currentGroup = [];
      }
    }

    // Step 5: Handle any remaining unbalanced trades (open group)
    if (currentGroup.length > 0) {
      await this._processGroup(currentGroup, symbol, userId, true); // Open group remains unbalanced
    }

    // Step 6: Mark orphaned groups as deleted (if they are no longer relevant)
    await this._markOrphanedGroupsAsDeleted(orphanedGroups);
  }

  // Helper function to calculate buyQty, sellQty, buyAvg, sellAvg
  static _calculateGroupMetrics(groupTrades, isOpen) {
    let buyQty = 0,
      sellQty = 0,
      buyTotal = 0,
      sellTotal = 0;

    for (const { position, quantity, entryPrice } of groupTrades) {
      if (position === 'Buy') {
        buyQty += quantity;
        buyTotal += quantity * entryPrice;
      } else if (position === 'Sell') {
        sellQty += quantity;
        sellTotal += quantity * entryPrice;
      }
    }

    const buyAvg = (buyQty ? buyTotal / buyQty : 0)?.toFixed(2);
    const sellAvg = (sellQty ? sellTotal / sellQty : 0)?.toFixed(2);

    if (isOpen) {
      const initialPosition = groupTrades[0]?.position;
      return {
        buyQty,
        sellQty,
        buyAvg: initialPosition === 'Buy' ? buyAvg : null,
        sellAvg: initialPosition === 'Sell' ? sellAvg : null,
      };
    }

    return { buyQty, sellQty, buyAvg, sellAvg };
  }

  // Helper function to process a group and update group properties
  static async _processGroup(groupTrades, symbol, userId, isOpen) {
    if (groupTrades.length === 0) {
      return;
    }

    const { buyQty, sellQty, buyAvg, sellAvg } = this._calculateGroupMetrics(
      groupTrades,
      isOpen
    );

    // Create a new group or update existing one
    const groupId = await TradeHistoryRepository.createGroup(
      userId,
      symbol,
      groupTrades,
      buyQty,
      sellQty,
      buyAvg,
      sellAvg,
      isOpen
    );

    // Update each trade with the new groupId
    for (const trade of groupTrades) {
      await tradeRepository.updateTradeGroupId(trade._id, groupId);
    }
  }

  // Helper function to mark orphaned groups as deleted
  static async _markOrphanedGroupsAsDeleted(orphanedGroups) {
    for (const orphanedGroupId of orphanedGroups) {
      await TradeHistoryRepository.markGroupAsDeleted(orphanedGroupId);
    }
  }

  static async getPnLSummary(userId, startDate, endDate) {
    const trades = await tradeRepository.getTradesByDateRange(
      userId,
      startDate,
      endDate
    );

    let totalPnL = 0;
    let groupedPnL = {};

    for (const trade of trades) {
      if (trade.sellPrice && trade.buyPrice && trade.quantity) {
        const pnl = (trade.sellPrice - trade.buyPrice) * trade.quantity;
        totalPnL += pnl;

        if (trade.groupId) {
          if (!groupedPnL[trade.groupId]) {
            groupedPnL[trade.groupId] = 0;
          }
          groupedPnL[trade.groupId] += pnl;
        }
      }
    }

    return { totalPnL, groupedPnL };
  }
}

export { TradingJournalService };
