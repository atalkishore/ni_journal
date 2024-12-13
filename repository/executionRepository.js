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
    return groups;
  },
};

export { executionRepository };
