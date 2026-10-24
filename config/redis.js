
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is required");
}

const redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) => {
      return Math.min(retries * 500, 5000);
    },
  },
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

redisClient.on("ready", () => {
  console.log("Redis is ready");
});

redisClient.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

export const redisReady = redisClient.connect().catch((error) => {
  console.error("Initial Redis connection failed:", error.message);
});

export default redisClient;
