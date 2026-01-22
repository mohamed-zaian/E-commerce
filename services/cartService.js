import asyncHandler from "express-async-handler";
import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";
import Coupon from "../model/couponModel.js";

/* ===================== HELPERS ===================== */

const checkCartItem = (cart, color, productId, product) => {
  const item = cart.cartItems.find(
    (i) => i.product.toString() === productId && i.color === color
  );

  if (item) {
    item.quantity += 1;
  } else {
    cart.cartItems.push({
      product: productId,
      color,
      price: product.price,
    });
  }
};

const calcTotalCartPrice = (cart) => {
  let total = 0;
  cart.cartItems.forEach((item) => {
    total += item.price * item.quantity;
  });
  return total;
};

/* ===================== CONTROLLERS ===================== */

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "cartItems.product",
    "name price imageCover  -_id"
  );

  res.status(200).json({
    length: cart ? cart.cartItems.length : 0,

    data: cart,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndDelete({ user: req.user._id });
  res.status(200).json({
    msg: "Cart cleared successfully",
    cart,
  });
});

export const addProductToCart = asyncHandler(async (req, res) => {
  const { productId, color } = req.body;

  /* 1️⃣ Validate product */
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ msg: "Product not found" });
  }

  /* 2️⃣ Get or create cart */
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
        },
      ],
    });
  } else {
    checkCartItem(cart, color, productId, product);
  }

  /* 3️⃣ Calculate total price */
  const totalPrice = calcTotalCartPrice(cart);
  cart.totalCartPrice = totalPrice;

  await cart.save();

  res.status(200).json({ length: cart.cartItems.length, data: cart });
});

export const removeProductFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ msg: "Cart not found" });
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({ msg: "Product not found in cart" });
  }

  cart.cartItems.splice(itemIndex, 1);
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    msg: "Product removed from cart successfully",
    data: cart,
  });
});

export const updateProductQuantityInCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(404).json({ msg: "Cart not found" });
  }

  const item = cart.cartItems.find((i) => i.product.toString() === productId);
  if (!item) {
    return res.status(404).json({ msg: "Product not found in cart" });
  }

  item.quantity = quantity;
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    msg: "Product quantity updated successfully",
    data: cart,
  });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  console.log(coupon)
  const validCoupon = await Coupon.findOne({
    name: coupon.trim(),
    expire: { $gt: Date.now() },
  });
  if (!validCoupon) {
    return res.status(400).json({ msg: "Invalid or expired coupon" });
  }
  const discountAmount = (cart.totalCartPrice * validCoupon.discount) / 100;
  cart.totalPriceAfterDiscount = cart.totalCartPrice - discountAmount;
  await cart.save();
  res.status(200).json({
    msg: "Coupon applied successfully",
    data: cart,
  });
});
