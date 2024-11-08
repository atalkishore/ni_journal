const redis = require('redis');

let redisClientInstance = null;

// Create and configure Redis client
const createRedisClient = () => {
    if (!redisClientInstance) {
        const redisURL = `redis://default:${process.env.REDISDB_PASSWORD}@${process.env.REDISDB_URL}:${process.env.REDISDB_PORT}`;

        redisClientInstance = redis.createClient({
            url: redisURL
        });

        // Handle Redis client connection errors
        redisClientInstance.on('error', (err) => {
            console.error('Redis error:', err);
        });
        redisClientInstance.on('connect', () => {
            console.log('Connected to RedisDB');
        });
    }
    return redisClientInstance;
};

module.exports = createRedisClient();
