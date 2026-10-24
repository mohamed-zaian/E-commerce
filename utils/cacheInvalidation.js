import redisClient from "../config/redis.js";

export const invalidateOrdersCache = async () => {
  try {
    if (!redisClient.isReady) return;

    for await (const key of redisClient.scanIterator({
      MATCH: "admin:orders:*",
      COUNT: 100,
    })) {
      await redisClient.del(key);
    }

    // Invalidate related analytics and dashboard caches
    await redisClient.del("admin:analytics", "admin:dashboard:stats");
  } catch (error) {
    console.error("[Redis] Orders cache invalidation failed:", error.message);
  }
};

export const invalidateCustomersCache = async () => {
  try {
    if (!redisClient.isReady) return;

    for await (const key of redisClient.scanIterator({
      MATCH: "admin:customers:*",
      COUNT: 100,
    })) {
      await redisClient.del(key);
    }

    console.log("[Redis] Customer cache invalidated");
  } catch (error) {
    console.error("[Redis] Customer cache invalidation failed:", error.message);
  }
};

export const invalidateWishlistCache = async (userId) => {
  try {
    if (!redisClient.isReady) return;

    await redisClient.del(`wishlist:${userId}`);
    console.log("[Redis] Wishlist cache invalidated");
  } catch (error) {
    console.error("[Redis] Wishlist cache invalidation failed:", error.message);
  }
};



export const invalidateUserCache = async (userId) => {
  try {
    if (!redisClient.isReady) return;

    // Invalidate the individual user's cached details
    if (userId) {
      await redisClient.del(`User:details:${userId}`);
    }

    // Invalidate cached user lists
    const keys = [];

    for await (const key of redisClient.scanIterator({
      MATCH: "User:list:*",
      COUNT: 100,
    })) {
      keys.push(key);
    }

    if (keys.length) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error("[Redis] User cache invalidation failed:", error.message);
  }
};
