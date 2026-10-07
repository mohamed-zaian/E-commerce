import asyncHandler from "express-async-handler";
import Product from "../model/productModel.js";
import FactoryHandler from "./factoryhandler.js";
import Cart from "../model/cartModel.js";
import Order from "../model/orderModel.js";

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

  // ==========================
  // Get Order First
  // ==========================

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  // ==========================
  // Prevent duplicate cancellation
  // ==========================

  const wasAlreadyCancelled = order.status === "cancelled";

  // ==========================
  // Return Stock
  // Only when changing TO cancelled
  // ==========================

  if (status === "cancelled" && !wasAlreadyCancelled) {
    for (const item of order.cartItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        continue;
      }

      // Find the size that was ordered
      const sizeIndex = product.sizes.findIndex(
        (size) => size.size === item.size,
      );

      if (sizeIndex === -1) {
        continue;
      }

      // Return quantity to the ordered size
      product.sizes[sizeIndex].quantity += item.quantity;

      // Decrease sold quantity
      product.sold = Math.max(0, (product.sold || 0) - item.quantity);

      // Update best seller / trending
      product.isBestSeller = product.sold >= 100;
      product.isTrending = product.sold >= 50;

      await product.save();
    }
  }

  // ==========================
  // Update Order Status
  // ==========================

  order.status = status;

  await order.save();

  // Populate user after update
  await order.populate("user", "name email");

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});
export const getAllOrders = asyncHandler(async (req, res) => {
  const { keyword, status, page = 1, limit = 10 } = req.query;
  let filter = req.filter || {};

  // status filter
  if (status) {
    filter.status = status;
  }

  // search order/customer
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

  const skip = (page - 1) * limit;

  const [totalOrders, orders] = await Promise.all([
    Order.countDocuments(filter),

    Order.find(filter)
      .populate("user", "firstName lastName email")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
  ]);

  res.status(200).json({
    result: orders.length,

    totalOrders,

    currentPage: Number(page),

    totalPages: Math.ceil(totalOrders / limit),

    limit: Number(limit),

    data: orders,
  });
});

export const getSpacificOrder = factoryHandler.getOne;
