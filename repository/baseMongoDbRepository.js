const { MongoClient } = require('mongodb');
const { LOGGER } = require('../config/winston-logger.config');

const uri = process.env.MONGO_DB_URL; // Connection URI
let client = null;
async function connect() {
    if (!client) {
        try {
            client = await MongoClient.connect(uri);
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err);
            throw err;
        }
    }
    return client.db(process.env.MONGO_DB_NAME);
}
let mongodb = connect();

module.exports = { connect, mongodb };
