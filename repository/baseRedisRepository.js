import * as redis from "redis";

import {
  REDISDB_PASSWORD,
  REDISDB_PORT,
  REDISDB_URL,
} from "../config/env.constant.js";
import { LOGGER } from "../config/winston-logger.config.js";

let redisClientInstance = null;

// Create and configure Redis client
const createRedisClient = async () => {
  if (!redisClientInstance) {
    const redisURL = `redis://default:${REDISDB_PASSWORD}@${REDISDB_URL}:${REDISDB_PORT}`;

    redisClientInstance = redis.createClient({ url: redisURL });

    // Handle Redis client connection errors
    redisClientInstance.on("error", (err) => {
      LOGGER.debug("Redis error:", err);
    });

    // Connect to Redis
    redisClientInstance.on("connect", () => {
      LOGGER.debug("Connected to RedisDB");
    });

    await redisClientInstance.connect();
  }

  return redisClientInstance;
};

export { createRedisClient, redisClientInstance as redisClient };
