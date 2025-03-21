import { MongoClient, ObjectId } from 'mongodb';

import { MONGO_DB_NAME, MONGO_DB_URL } from '../config/env.constant.js';
import { LOGGER } from '../config/winston-logger.config.js';

let client = null;
let mongodb = null;

async function connect() {
  if (!client) {
    try {
      client = await MongoClient.connect(MONGO_DB_URL, {
        useUnifiedTopology: true,
      });
      LOGGER.debug('Connected to MongoDB');
    } catch (err) {
      LOGGER.error('Failed to connect to MongoDB:', err);
      throw err;
    }
  }
  mongodb = client.db(MONGO_DB_NAME);
  return client.db(MONGO_DB_NAME);
}

const baseRepository = {
  async getDb() {
    return await connect();
  },

  async insertOne(collectionName, document) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.insertOne(document);
  },

  async find(collectionName, query = {}, options = {}) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.find(query, options).toArray();
  },

  async findOneById(collectionName, id) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.findOne({ _id: new ObjectId(id) });
  },
  async findOne(collectionName, query = {}, options = {}) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.findOne(query, options);
  },

  async updateOneById(collectionName, id, updateData) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  },

  async updateOne(collectionName, query = {}, updateData) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.updateOne(query, { $set: updateData });
  },

  async deleteOneById(collectionName, id) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.deleteOne({ _id: new ObjectId(id) });
  },

  async findOneAndUpdate(collectionName, query = {}, updateData) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.findOneAndUpdate(
      query,
      { $inc: updateData },
      { returnDocument: 'after' }
    );
  },

  async updateOneWithOperators(collectionName, query = {}, updateOperators) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.updateOne(query, updateOperators);
  },

  async countDocuments(collectionName, query = {}) {
    const db = await connect();
    return await db.collection(collectionName).countDocuments(query);
  },

  async deleteOneByFilter(collectionName, filter) {
    const db = await connect();
    const collection = db.collection(collectionName);
    return await collection.deleteOne(filter);
  },
};

export { connect, mongodb, baseRepository };
