import asyncHandler from "express-async-handler";
import ApiFeature from "../utils/apiFeature.js";
import redisClient, { redisReady } from "../config/redis.js";

class FactoryHandler {
  constructor(model) {
    this.model = model;
  }

  getCacheKey = (req, type) => {
    const query = JSON.stringify(req.query || {});
    const filter = JSON.stringify(req.filter || {});

    if (type === "details") {
      return `${this.model.modelName}:details:${req.params.id}`;
    }

    return `${this.model.modelName}:list:${query}:${filter}`;
  };

  getCachedData = async (key) => {
    try {
      await redisReady;

      if (!redisClient.isReady) return null;

      const cached = await redisClient.get(key);

      if (cached !== null) {
        console.log(`[Redis][HIT] ${key}`);
        return JSON.parse(cached);
      }

      console.log(`[Redis][MISS] ${key}`);
      return null;
    } catch (error) {
      console.error("[Redis] Cache read failed:", error.message);
      return null;
    }
  };

  setCachedData = async (key, data, ttl = 60) => {
    try {
      if (!redisClient.isReady) return;

      await redisClient.set(key, JSON.stringify(data), {
        EX: ttl,
      });

      console.log(`[Redis][SET] ${key}`);
    } catch (error) {
      console.error("[Redis] Cache write failed:", error.message);
    }
  };

  // Invalidate cached lists and details for this model.
  invalidateCache = async (id) => {
    try {
      await redisReady;

      if (!redisClient.isReady) return;

      const keys = await redisClient.keys(`${this.model.modelName}:*`);

      const matchingKeys = id
        ? keys.filter(
            (key) =>
              key === `${this.model.modelName}:details:${id}` ||
              key.startsWith(`${this.model.modelName}:list:`),
          )
        : keys;

      if (matchingKeys.length > 0) {
        await redisClient.del(matchingKeys);
      }
    } catch (error) {
      console.error("[Redis] Cache invalidation failed:", error.message);
    }
  };

  // Delete one
  deleteOne = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await this.model.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        error: `${this.model.modelName} not found`,
      });
    }

    await this.invalidateCache(id);

    return res.status(200).json({
      msg: `The ${this.model.modelName} has been deleted successfully.`,
    });
  });

  // Update one
  updateOne = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await this.model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        error: `This ${this.model.modelName} with id ${id} was not found`,
      });
    }

    await this.invalidateCache(id);

    return res.status(200).json({ data: item });
  });

  // Get one
  getOne = (populateOptions) =>
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const cacheKey = this.getCacheKey(req, "details");

      const cachedData = await this.getCachedData(cacheKey);

      if (cachedData !== null) {
        return res.status(200).json(cachedData);
      }

      let query = this.model.findById(id);

      if (populateOptions) {
        query = query.populate(populateOptions);
      }

      const item = await query;

      if (!item) {
        return res.status(404).json({
          error: `${this.model.modelName} not found`,
        });
      }

      const response = { data: item };

      await this.setCachedData(cacheKey, response, 60);

      return res.status(200).json(response);
    });

  // Get all
  getAll = asyncHandler(async (req, res) => {
    const filterObj =
      req.filter && typeof req.filter === "object" ? req.filter : {};

    const cacheKey = this.getCacheKey(req, "list");
    const cachedData = await this.getCachedData(cacheKey);

    if (cachedData !== null) {
      return res.status(200).json(cachedData);
    }

    const totalItems = await this.model.countDocuments(filterObj);

    const sort = this.model.modelName === "Order" ? "-createdAt" : "createdAt";

    const apiFeature = new ApiFeature(
      this.model.find(filterObj).sort(sort),
      req.query,
    )
      .search()
      .filtering()
      .paginate()
      .limitFields();

    const items = await apiFeature.mongooseQuery;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const response = {
      result: items.length,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      data: items,
    };

    await this.setCachedData(cacheKey, response, 60);

    return res.status(200).json(response);
  });

  // Create one
  createOne = asyncHandler(async (req, res) => {
    const item = await this.model.create(req.body);

    await this.invalidateCache();

    return res.status(201).json({ data: item });
  });
}

export default FactoryHandler;
