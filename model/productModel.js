import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);


const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name too short"],
    },

    slug: {
      type: String,
      lowercase: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [200000, "Description too long"],
    },

    materials: {
      type: String,
      default: "Premium materials",
    },

    // Pricing

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
      max: 20000,
    },

    priceAfterDiscount: {
      type: Number,
      default: null,
    },

    // Inventory

    sold: {
      type: Number,
      default: 0,
    },

    colors: [String],

    sizes: [sizeSchema],

    // Images

    imageCover: {
      type: String,
      required: [true, "Image cover is required"],
    },

    images: [String],

    // Relations

    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to category"],
    },

    subCategory: {
      type: mongoose.Schema.ObjectId,
      ref: "subCategory",
    },

    // Ecommerce flags

    featured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    onSale: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    tags: [String],

    // Reviews

    ratingsAverage: {
      type: Number,
      min: [0, "Rating must be >= 1"],
      max: [5, "Rating must be <= 5"],
      default: 0,
    },

    ratingQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);

// Virtual reviews

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.path("sizes").validate(function (sizes) {
  const values = sizes.map((item) => item.size);

  return values.length === new Set(values).size;
}, "Duplicate sizes are not allowed");

productSchema.virtual("totalStock").get(function () {
  return this.sizes.reduce((total, item) => total + item.quantity, 0);
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
  
export default Product;
