
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config({ path: "./config.env" });

const redisUrl =
  process.env.REDIS_URL || "redis://127.0.0.1:6379";


const redisClient = createClient({
  url: redisUrl,
  RESP: 2,
  socket: {
    connectTimeout: 10000,
    reconnectStrategy: (retries) =>
      Math.min(retries * 500, 5000),
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
