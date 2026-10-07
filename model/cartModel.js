import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    size: {
      type: String,
      required: true,
    },

    color: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  {
    _id: true,
  },
);

const cartSchema = new mongoose.Schema(
  {
    cartItems: [cartItemSchema],

    totalCartPrice: {
      type: Number,
      default: 0,
    },

    totalPriceAfterDiscount: {
      type: Number,
      default: 0,
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  },
);



const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
