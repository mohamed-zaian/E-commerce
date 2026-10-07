import upload from "../middleware/uploadImageMiddleware.js";
import Product from "../model/productModel.js";
import FactoryHandler from "./factoryhandler.js";
import asyncHandler from "express-async-handler";

// =========================
// Image Upload
// =========================

export const uploadproductImage = upload("products").fields([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

export const setImagetoBody = (req, res, next) => {
  try {
    if (req.files?.imageCover?.length) {
      req.body.imageCover = req.files.imageCover[0].path;
    }

    if (req.files?.images?.length) {
      req.body.images = req.files.images.map((image) => image.path);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// =========================
// Factory CRUD
// =========================

const factoryHandler = new FactoryHandler(Product);

export const createProduct = asyncHandler(async (req, res, next) => {
  // imageCover was already converted to a Cloudinary URL
  // by setImagetoBody.

  if (req.body.imageCover) {
    const galleryImages = Array.isArray(req.body.images) ? req.body.images : [];

    // Make imageCover the FIRST image.
    // Also prevent duplicate cover.
    req.body.images = [
      req.body.imageCover,
      ...galleryImages.filter(
        (image) => String(image) !== String(req.body.imageCover),
      ),
    ];
  }

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// =========================
// Get products with filters
export const getlistProducts = asyncHandler(async (req, res) => {
  const filter = {};

  const {
    category,
    keyword,
    subCategory,
    size,
    color,
    onSale,
    isNewArrival,
    isBestSeller,
    isTrending,
    featured,
    inStock,
  } = req.query;

  // ===============================
  // Search
  // ===============================

  if (keyword) {
    filter.$or = [
      {
        name: {
          $regex: keyword,
          $options: "i",
        },
      },
      {
        description: {
          $regex: keyword,
          $options: "i",
        },
      },
    ];
  }

  // ===============================
  // Category
  // ===============================

  if (category) {
    filter.category = category;
  }

  // ===============================
  // SubCategory
  // ===============================

  if (subCategory) {
    filter.subCategory = subCategory;
  }

  // ===============================
  // Size + Stock
  // ===============================

  if (size || inStock === "true") {
    filter.sizes = {
      $elemMatch: {
        ...(size && {
          size,
        }),

        ...(inStock === "true" && {
          quantity: {
            $gt: 0,
          },
        }),
      },
    };
  }

  // ===============================
  // Color
  // ===============================

  if (color) {
    filter.colors = color;
  }

  // ===============================
  // Boolean filters
  // ===============================

  if (onSale === "true") {
    filter.onSale = true;
  }

  if (isNewArrival === "true") {
    filter.isNewArrival = true;
  }

  if (isBestSeller === "true") {
    filter.isBestSeller = true;
  }

  if (isTrending === "true") {
    filter.isTrending = true;
  }

  if (featured === "true") {
    filter.featured = true;
  }

  // ===============================
  // Pagination
  // ===============================

  const page = Math.max(Number(req.query.page) || 1, 1);

  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

  const skip = (page - 1) * limit;

  // ===============================
  // Get total + products
  // ===============================

  const [totalProducts, products] = await Promise.all([
    Product.countDocuments(filter),

    Product.find(filter)
      .populate("category", "name")
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .skip(skip)
      .limit(limit),
  ]);

  // ===============================
  // Response
  // ===============================

  res.status(200).json({
    result: products.length,

    totalProducts,

    currentPage: page,

    totalPages: Math.ceil(totalProducts / limit),

    limit,

    data: products,
  });
});

export const getProduct = factoryHandler.getOne([
  {
    path: "reviews",
  },
  {
    path: "category",
    select: "name",
  },
  {
    path: "subCategory",
    select: "name",
  },
]);
export const parseProductFields = (req, res, next) => {
  try {
    if (req.body.sizes) {
      req.body.sizes = JSON.parse(req.body.sizes);
    }

    if (req.body.colors) {
      req.body.colors = JSON.parse(req.body.colors);
    }

    if (req.body.tags) {
      req.body.tags = JSON.parse(req.body.tags);
    }

    if (req.body.existingImages) {
      req.body.existingImages = JSON.parse(req.body.existingImages);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(new ApiError(`No product found for this id ${id}`, 404));
  }

  // =====================================================
  // NEW COVER IMAGE
  // =====================================================
  //
  // setImagetoBody already changed:
  //
  // req.files.imageCover[0].path
  //
  // into:
  //
  // req.body.imageCover
  //
  // =====================================================

  if (req.body.imageCover) {
    const newCover = String(req.body.imageCover);

    const oldImages = Array.isArray(product.images)
      ? product.images.map((image) => String(image))
      : [];

    const oldCover = product.imageCover ? String(product.imageCover) : "";

    // Remove old cover from images
    // and prevent the new cover from appearing twice.
    const remainingImages = oldImages.filter(
      (image) => image !== oldCover && image !== newCover,
    );

    // New cover MUST be first.
    req.body.images = [newCover, ...remainingImages];
  }

  // =====================================================
  // NEW GALLERY IMAGES
  // =====================================================
  //
  // If setImagetoBody received new "images",
  // append them after the current cover.
  //
  // =====================================================

  if (Array.isArray(req.body.images)) {
    const newGalleryImages = req.body.images;

    // If imageCover was changed, req.body.images
    // already contains the complete array above.
    //
    // Otherwise, if only gallery images were uploaded,
    // preserve existing images and append the new ones.

    if (!req.body.imageCover) {
      const oldImages = Array.isArray(product.images)
        ? product.images.map((image) => String(image))
        : [];

      const newImages = newGalleryImages
        .map((image) => String(image))
        .filter((image) => !oldImages.includes(image));

      const cover = product.imageCover ? String(product.imageCover) : "";

      req.body.images = [
        ...(cover ? [cover] : []),
        ...oldImages.filter((image) => image !== cover),
        ...newImages,
      ];
    }
  }

  console.log("========== UPDATE PRODUCT ==========");

  console.log("ID:", id);

  console.log("BODY:", req.body);

  console.log("IMAGE COVER:", req.body.imageCover);

  console.log("IMAGES:", req.body.images);

  // =====================================================
  // UPDATE
  // =====================================================

  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    return next(new ApiError(`No product found for this id ${id}`, 404));
  }

  console.log("UPDATED IMAGE COVER:", updatedProduct.imageCover);

  console.log("UPDATED IMAGES:", updatedProduct.images);

  console.log("====================================");

  res.status(200).json({
    success: true,
    data: updatedProduct,
  });
});
export const deleteProduct = factoryHandler.deleteOne;

// =========================
// Category helper
// =========================

export const setCategoryID = (req, res, next) => {
  if (req.params.id) {
    req.body.category = req.params.id;
  }

  next();
};

// =========================
// Special Product APIs
// =========================

// Featured products

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;

  const products = await Product.find({
    featured: true,
  }).limit(limit);

  res.status(200).json({
    result: products.length,

    data: products,
  });
});

// New arrivals

export const getNewArrivals = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 8;

  // Remove new arrival flag after 7 days
  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  await Product.updateMany(
    {
      createdAt: {
        $lt: sevenDaysAgo,
      },

      isNewArrival: true,
    },

    {
      $set: {
        isNewArrival: false,
      },
    },
  );

  const products = await Product.find({
    isNewArrival: true,
  })
    .sort({
      createdAt: -1,
    })
    .limit(limit);

  res.status(200).json({
    result: products.length,

    data: products,
  });
});

// On sale

export const getOnSaleProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 4;

  const products = await Product.find({
    onSale: true,
  }).limit(limit);

  res.status(200).json({
    result: products.length,

    data: products,
  });
});

// Best sellers

export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({
    sold: -1,
  });

  res.status(200).json({
    result: products.length,

    data: products,
  });
});

// Trending

export const getTrendingProducts = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 4;

  const products = await Product.find({
    isTrending: true,
  }).limit(limit);

  res.status(200).json({
    result: products.length,

    data: products,
  });
});

// =========================
// Related products
// =========================
// =========================
// Related products
// =========================

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const limit = Number(req.query.limit) || 4;

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const products = await Product.find({
    _id: {
      $ne: product._id,
    },

    $or: [
      {
        category: product.category,
      },
    ],
  }).limit(limit);

  res.status(200).json({
    result: products.length,

    data: products,
  });
});
