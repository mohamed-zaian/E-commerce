import asyncHandler from "express-async-handler";
import Product from "../model/productModel.js";
import User from "../model/userModel.js";
import Order from "../model/orderModel.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalProducts, totalUsers, totalOrders, buyers, revenueResult] =
    await Promise.all([
      // Total products
      Product.countDocuments(),

      // Registered customers
      User.countDocuments({
        role: "user",
      }),

      // Orders excluding cancelled
      Order.countDocuments({
        status: {
          $ne: "cancelled",
        },
      }),

      // Customers who placed orders
      Order.distinct("user"),

      // Revenue
      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: "$totalOrderPrice",
            },
          },
        },
      ]),
    ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const conversionRate =
    totalUsers > 0 ? ((buyers.length / totalUsers) * 100).toFixed(1) : 0;

  res.status(200).json({
    totalRevenue,

    totalOrders,

    totalCustomers: totalUsers,

    totalProducts,

    averageOrderValue: Number(averageOrderValue.toFixed(2)),

    conversionRate: Number(conversionRate),
  });
});

export const getBestSellers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;

  const bestSellers = await Product.find({
    isBestSeller: true,
  })
    .sort({
      sold: -1,
    })
    .limit(limit);

  res.status(200).json({
    result: bestSellers.length,

    data: bestSellers,
  });
});

export const getAnalytics = asyncHandler(async (req, res) => {
  // ==========================
  // Last 12 Months Range
  // ==========================

  const now = new Date();

  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  // ==========================
  // Run Analytics Queries Together
  // ==========================

  const [monthlyRevenue, salesByCategory, ordersByStatus, recentOrders] =
    await Promise.all([
      // ==========================
      // Monthly Revenue
      // ==========================

      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },

            createdAt: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },

              month: {
                $month: "$createdAt",
              },
            },

            revenue: {
              $sum: "$totalOrderPrice",
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),

      // ==========================
      // Sales By Category
      // ==========================

      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "cancelled",
            },
          },
        },

        {
          $unwind: "$cartItems",
        },

        {
          $lookup: {
            from: "products",

            localField: "cartItems.product",

            foreignField: "_id",

            as: "product",
          },
        },

        {
          $unwind: "$product",
        },

        {
          $lookup: {
            from: "categories",

            localField: "product.category",

            foreignField: "_id",

            as: "category",
          },
        },

        {
          $unwind: "$category",
        },

        {
          $group: {
            _id: "$category.name",

            sales: {
              $sum: {
                $multiply: ["$cartItems.price", "$cartItems.quantity"],
              },
            },
          },
        },

        {
          $sort: {
            sales: -1,
          },
        },
      ]),

      // ==========================
      // Orders Status
      // ==========================

      Order.aggregate([
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      // ==========================
      // Recent Activity
      // ==========================

      Order.find()

        .sort({
          createdAt: -1,
        })

        .limit(10)

        .select("orderNumber status totalOrderPrice createdAt"),
    ]);

  // ==========================
  // Format Monthly Data
  // ==========================

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",

    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyMap = {};

  monthlyRevenue.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;

    monthlyMap[key] = {
      month: monthNames[item._id.month - 1],

      year: item._id.year,

      revenue: item.revenue,

      orders: item.orders,
    };
  });

  const monthlyRevenueFormatted = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(
      now.getFullYear(),

      now.getMonth() - i,

      1,
    );

    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    monthlyRevenueFormatted.push(
      monthlyMap[key] || {
        month: monthNames[date.getMonth()],

        year: date.getFullYear(),

        revenue: 0,

        orders: 0,
      },
    );
  }

  // ==========================
  // Recent Activity Format
  // ==========================

  const recentActivity = recentOrders.map((order) => ({
    id: order._id,

    type: "order",

    message: `Order ${order.orderNumber} is ${order.status}`,

    amount: order.totalOrderPrice,

    time: getTimeAgo(order.createdAt),

    orderId: order.orderNumber,
  }));

  // ==========================
  // Response
  // ==========================

  res.status(200).json({
    monthlyRevenue: monthlyRevenueFormatted,

    salesByCategory,

    ordersByStatus,

    recentActivity,
  });
});
export const getAllCustomers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const customers = await User.aggregate([
    {
      $match: {
        role: "user",
      },
    },

    {
      $lookup: {
        from: "orders",

        let: {
          customerId: "$_id",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$user", "$$customerId"],
              },

              status: {
                $ne: "cancelled",
              },
            },
          },

          {
            $project: {
              orderNumber: 1,

              totalOrderPrice: 1,

              status: 1,

              createdAt: 1,
            },
          },
        ],

        as: "orders",
      },
    },

    // only customers who ordered
    {
      $match: {
        "orders.0": {
          $exists: true,
        },
      },
    },

    {
      $addFields: {
        totalOrders: {
          $size: "$orders",
        },

        totalSpent: {
          $sum: "$orders.totalOrderPrice",
        },
      },
    },

    {
      $addFields: {
        averageOrderValue: {
          $cond: [
            {
              $gt: ["$totalOrders", 0],
            },

            {
              $divide: ["$totalSpent", "$totalOrders"],
            },

            0,
          ],
        },
      },
    },

    {
      $project: {
        firstName: 1,

        lastName: 1,

        email: 1,

        phone: 1,

        imageProfile: 1,

        createdAt: 1,

        updatedAt: 1,

        addresses: 1,

        totalOrders: 1,

        totalSpent: 1,

        averageOrderValue: 1,

        orders: 1,
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $skip: skip,
    },

    {
      $limit: limit,
    },
  ]);

  const totalCustomers = await User.aggregate([
    {
      $match: {
        role: "user",
      },
    },

    {
      $lookup: {
        from: "orders",

        localField: "_id",

        foreignField: "user",

        as: "orders",
      },
    },

    {
      $match: {
        "orders.0": {
          $exists: true,
        },
      },
    },

    {
      $count: "total",
    },
  ]);

  const total = totalCustomers[0]?.total || 0;

  res.status(200).json({
    result: customers.length,

    total,

    page,

    totalPages: Math.ceil(total / limit),

    limit,

    data: customers,
  });
});
// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}
export const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const { status, paymentMethodType } = req.query;

  const filter = {};

  if (status && status !== "all") {
    filter.status = status;
  }

  if (paymentMethodType && paymentMethodType !== "all") {
    filter.paymentMethodType = paymentMethodType;
  }

  console.log("ADMIN ORDER FILTER:", filter);

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

    Order.countDocuments(filter),
  ]);

  const ordersData = orders.map((order) => ({
    ...order,

    cartItems: Array.isArray(order.cartItems) ? order.cartItems : [],

    shippingAddress: order.shippingAddress || null,

    user: order.user || null,
  }));

  res.status(200).json({
    success: true,
    result: ordersData.length,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: ordersData,
  });
});
