import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import redisClient, { redisReady } from "../config/redis.js";

const invalidateWishlistCache = async (userId) => {
  try {
    if (redisClient.isReady) {
      await redisClient.del(`wishlist:${userId}`);
      console.log(`[Redis][INVALIDATE] wishlist:${userId}`);
    }
  } catch (error) {
    console.error("[Redis] Wishlist cache invalidation failed:", error.message);
  }
};

export const addToWishList = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: productId },
    },
    { new: true, runValidators: true },
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await invalidateWishlistCache(user._id.toString());

  return res.status(200).json({
    message: "Product added to wishlist",
    wishlist: user.wishlist,
  });
});

export const removeFromWishList = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: id },
    },
    { new: true, runValidators: true },
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await invalidateWishlistCache(user._id.toString());

  return res.status(200).json({
    message: "Product removed from wishlist",
    wishlist: user.wishlist,
  });
});

export const getWishList = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const cacheKey = `wishlist:${userId}`;
  const TTL = 60;

  // Try Redis cache
  try {
    await redisReady;

    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData !== null) {
        console.log(`[Redis][HIT] ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
      }
    }
  } catch (error) {
    console.error("[Redis] Cache read failed:", error.message);
  }

  console.log(`[Redis][MISS] ${cacheKey}`);

  // Fetch wishlist from MongoDB
  const user = await User.findById(req.user._id).populate("wishlist");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const response = {
    total: user.wishlist.length,
    data: user.wishlist,
  };

  // Cache response for 60 seconds
  try {
    if (redisClient.isReady) {
      await redisClient.set(cacheKey, JSON.stringify(response), {
        EX: TTL,
      });

      console.log(`[Redis][SET] ${cacheKey}`);
    }
  } catch (error) {
    console.error("[Redis] Cache write failed:", error.message);
  }

  return res.status(200).json(response);
});
