import { MongoClient } from 'mongodb';

import { MONGO_DB_NAME, MONGO_DB_URL } from '../config/env.constant.js';
import { LOGGER } from '../config/winston-logger.config.js';

let client = null;
let mongodb = null;
async function connect() {
  const uri = MONGO_DB_URL; // Connection URI
  if (!client) {
    try {
      client = await MongoClient.connect(uri);
      LOGGER.debug('Connected to MongoDB');
    } catch (err) {
      LOGGER.debug('Failed to connect to MongoDB:', err);
      throw err;
    }
  }
  mongodb = client.db(MONGO_DB_NAME);
  return client.db(MONGO_DB_NAME);
}

export { connect, mongodb };
