import asyncHandler from "express-async-handler";
import Product from "../model/productModel.js";
import FactoryHandler from "./factoryhandler.js";
import Cart from "../model/cartModel.js";
import Order from "../model/orderModel.js";
import {
  invalidateOrdersCache,
  invalidateCustomersCache,
} from "../utils/cacheInvalidation.js";
import redisClient from "../config/redis.js";

const factoryHandler = new FactoryHandler(Order);
export const createOrder = asyncHandler(async (req, res) => {
  const taxPrice = 0;
  const shippingPrice = 0;

  const { cartId } = req.params;

  // ==========================
  // Get Cart
  // ==========================

  const cart = await Cart.findById(cartId).populate("cartItems.product");

  if (!cart) {
    return res.status(404).json({
      message: "There is no cart",
    });
  }

  // ==========================
  // Prepare Cart Items
  // ==========================

  const cartItems = cart.cartItems.map((item) => ({
    product: item.product._id,

    name: item.product.name,

    size: item.size || "One Size",

    color: item.color || "Default",

    quantity: item.quantity,

    price: item.price,

    image: item.product.imageCover,
  }));

  // ==========================
  // Check Stock
  // ==========================

  for (const item of cart.cartItems) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      return res.status(404).json({
        message: `${item.product.name} not found`,
      });
    }
    if (item.size === "ONE SIZE") {
      item.size = "One Size";
    }

    const size = product.sizes.find((size) => size.size === item.size);

    if (!size || size.quantity < item.quantity) {
      return res.status(400).json({
        message: `Not enough stock for ${product.name}`,
      });
    }
  }

  // ==========================
  // Update Product Stock
  // ==========================

  const bulkOption = cart.cartItems.map((item) => ({
    updateOne: {
      filter: {
        _id: item.product._id,

        "sizes.size": item.size,

        "sizes.quantity": {
          $gte: item.quantity,
        },
      },

      update: [
        // ==========================================
        // Update size quantity + sold
        // ==========================================

        {
          $set: {
            sizes: {
              $map: {
                input: "$sizes",

                as: "size",

                in: {
                  $cond: [
                    {
                      $eq: ["$$size.size", item.size],
                    },

                    {
                      $mergeObjects: [
                        "$$size",

                        {
                          quantity: {
                            $subtract: ["$$size.quantity", item.quantity],
                          },
                        },
                      ],
                    },

                    "$$size",
                  ],
                },
              },
            },

            sold: {
              $add: [
                {
                  $ifNull: ["$sold", 0],
                },
                item.quantity,
              ],
            },
          },
        },

        // ==========================================
        // Update best seller + trending
        // ==========================================

        {
          $set: {
            isBestSeller: {
              $gte: [
                {
                  $ifNull: ["$sold", 0],
                },
                100,
              ],
            },

            isTrending: {
              $gte: [
                {
                  $ifNull: ["$sold", 0],
                },
                50,
              ],
            },
          },
        },
      ],
    },
  }));

  const result = await Product.bulkWrite(bulkOption);

  // ==========================
  // Verify stock updates
  // ==========================

  if (result.modifiedCount !== cart.cartItems.length) {
    return res.status(400).json({
      message: "Some products do not have enough stock",
    });
  }

  // ==========================
  // Calculate Price
  // ==========================

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // ==========================
  // Create Order
  // ==========================

  const order = await Order.create({
    user: req.user._id,

    customerName: `${req.user.firstName} ${req.user.lastName}`,

    customerEmail: req.user.email,

    cartItems,

    shippingAddress: req.body.shippingAddress,

    paymentMethodType: req.body.paymentMethodType,

    subtotal: cartPrice,

    taxPrice,

    shippingPrice,

    totalOrderPrice,
  });

  // ==========================
  // Delete Cart
  // ==========================

  await Cart.findByIdAndDelete(cartId);

  // ==========================
  // Response
  // ==========================

  res.status(201).json({
    success: true,

    message: "Order created successfully",

    data: order,
  });
});

export const filterByLoggerUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filter = { user: req.user._id };
  }
  next();
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const allowedStatus = ["pending", "shipped", "delivered", "cancelled"];

  if (!allowedStatus.includes(status)) {
    return res.status(400).json({
      message: "Invalid order status",
    });
  }

  // Get order first
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  const wasAlreadyCancelled = order.status === "cancelled";

  // Return stock only when changing to cancelled
  if (status === "cancelled" && !wasAlreadyCancelled) {
    for (const item of order.cartItems) {
      const product = await Product.findById(item.product);

      if (!product) continue;

      const sizeIndex = product.sizes.findIndex(
        (size) => size.size === item.size,
      );

      if (sizeIndex === -1) continue;

      product.sizes[sizeIndex].quantity += item.quantity;

      product.sold = Math.max(0, (product.sold || 0) - item.quantity);

      product.isBestSeller = product.sold >= 100;
      product.isTrending = product.sold >= 50;

      await product.save();
    }
  }

  // Update order status
  order.status = status;
  await order.save();

  // Invalidate related caches after successful updates
  await invalidateOrdersCache();
  await invalidateCustomersCache();
  // Invalidate best-seller cache because product sales may have changed
  if (status === "cancelled" && !wasAlreadyCancelled && redisClient.isReady) {
    for await (const key of redisClient.scanIterator({
      MATCH: "products:best-sellers:*",
      COUNT: 100,
    })) {
      await redisClient.del(key);
    }
  }

  // Populate user after update
  await order.populate("user", "name email");

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { keyword, status } = req.query;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { ...(req.filter || {}) };

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Search by order number
  if (keyword) {
    filter.$or = [
      {
        orderNumber: {
          $regex: keyword,
          $options: "i",
        },
      },
    ];
  }

  const cacheKey = `admin:orders:${JSON.stringify({
    page,
    limit,
    keyword: keyword || "",
    status: status || "",
    filter,
  })}`;

  const TTL = 60;

  // 1. Try Redis cache
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

  // 2. Fetch orders from MongoDB
  const [totalOrders, orders] = await Promise.all([
    Order.countDocuments(filter),

    Order.find(filter)
      .populate("user", "firstName lastName email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit),
  ]);

  const response = {
    result: orders.length,
    totalOrders,
    currentPage: page,
    totalPages: Math.ceil(totalOrders / limit),
    limit,
    data: orders,
  };

  // 3. Cache response for 60 seconds
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

export const getSpacificOrder = factoryHandler.getOne;
