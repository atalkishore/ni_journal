import { ObjectId } from 'mongodb';

import { baseRepository } from './baseMongoDbRepository.js';

const collectionName = 'executions';

const executionRepository = {
  async createGroup(tradeIds) {
    const db = await baseRepository.getDb();
    const group = {
      tradeIds: tradeIds.map((id) => new ObjectId(id)),
      createdAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(group);
    return { _id: result.insertedId, ...group };
  },

  async getGroups() {
    const db = await baseRepository.getDb();
    const groups = await db.collection(collectionName).find({}).toArray();

    const tradeCollection = db.collection('trades');
    for (const group of groups) {
      group.trades = await tradeCollection
        .find({ _id: { $in: group.tradeIds } })
        .toArray();
    }

    return groups;
  },

  async getGroupDetails(groupId) {
    const db = await baseRepository.getDb();

    const group = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(groupId) });

    if (!group) {
      throw new Error('Group not found.');
    }

    const tradeCollection = db.collection('trades');
    const trades = await tradeCollection
      .find({ _id: { $in: group.tradeIds } })
      .toArray();

    return { ...group, trades };
  },

  async unlinkGroup(groupId) {
    const db = await baseRepository.getDb();
    const result = await db
      .collection(collectionName)
      .deleteOne({ _id: new ObjectId(groupId) });

    if (result.deletedCount === 0) {
      throw new Error('Group not found or already unlinked.');
    }

    return { success: true, message: 'Group unlinked successfully.' };
  },
};

export { executionRepository };
