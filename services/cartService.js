import asyncHandler from "express-async-handler";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";
import Coupon from "../model/couponModel.js";

/* ===================== HELPERS ===================== */

export const calcTotalCartPrice = (cart) => {

  return (cart.cartItems || []).reduce(
    (total, item) => total + item.price * item.quantity,

    0,
  );
};

/* ===================== GET CART ===================== */
export const getCart = asyncHandler(async (req, res) => {


const cart = await Cart.findOne({
  user: req.user._id,
});



await cart?.populate({
  path: "cartItems.product",
  model: "Product",
});

  res.status(200).json({
    length: cart?.cartItems?.length || 0,

    data: cart || {
      cartItems: [],
      totalCartPrice: 0,
    },
  });
});

/* ===================== ADD TO CART ===================== */

export const addProductToCart = asyncHandler(async (req, res) => {
  const { productId, size, quantity = 1 } = req.body;




let cart = (
  await Cart.findOne({
    user: req.user._id,
  })
);


  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  const selectedSize = product.sizes.find(
    (item) => item.size.toUpperCase() === size.toUpperCase(),
  );

  if (!selectedSize) {
    return res.status(400).json({
      message: "Size not available",
    });
  }

  if (selectedSize.quantity < quantity) {
    return res.status(400).json({
      message: "Not enough stock",
    });
  }



  if (!cart) {

    cart = await Cart.create({
      user: req.user._id,
      totalCartPrice: 0,

      cartItems: [],
    });
  }

const existingItem = cart.cartItems.find(
  (item) =>
    item.product.toString() === productId &&
    item.size?.toUpperCase() === size?.toUpperCase(),
);
  if (existingItem) {
    if (existingItem.quantity + quantity > selectedSize.quantity) {
      return res.status(400).json({
        message: "Quantity exceeds available stock",
      });
    }

    existingItem.quantity += quantity;
  } else {
    cart.cartItems.push({
      product: productId,

      size: size,

      quantity: quantity,

      price: product.priceAfterDiscount || product.price,
    });
  }
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    success: true,

    data: cart,
  });
});

/* ===================== REMOVE ITEM ===================== */
export const removeProductFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const { size } = req.body;

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      message: "Cart not found",
    });
  }

  // Find item by productId + size
  const item = cart.cartItems.find(
    (item) =>
      String(item.product).trim() === String(productId).trim() &&
      item.size.toUpperCase() === size.toUpperCase(),
  );


  if (!item) {
    return res.status(404).json({
      message: "Product not found in cart",
    });
  }

  // Remove item
  cart.cartItems.pull(item._id);

  // Recalculate total
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Product removed successfully",
    data: cart,
  });
});

/* ===================== UPDATE QUANTITY ===================== */

export const updateProductQuantityInCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity, size } = req.body;

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      message: "Cart not found",
    });
  }

  // Find item by productId + size
const item = cart.cartItems.find(
  (cartItem) =>
    String(cartItem.product).trim() === String(productId).trim() &&
    cartItem.size.trim().toUpperCase() === size.trim().toUpperCase()
);




  if (!item) {
    return res.status(404).json({
      message: "Product not found in cart",
    });
  }

  // Get product stock
  const product = await Product.findById(item.product);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  // Check size stock
  const selectedSize = product.sizes.find(
    (s) => s.size.toUpperCase() === item.size.toUpperCase(),
  );

  if (!selectedSize) {
    return res.status(400).json({
      message: "Size not available",
    });
  }

  if (quantity > selectedSize.quantity) {
    return res.status(400).json({
      message: "Not enough stock",
    });
  }

  // Update quantity
  item.quantity = quantity;

  // Recalculate cart total
  cart.totalCartPrice = calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Quantity updated successfully",
    data: cart,
  });
});

/* ===================== CLEAR CART ===================== */

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndDelete({
    user: req.user._id,
  });

  res.status(200).json({
    msg: "Cart cleared successfully",

    cart,
  });
});

/* ===================== APPLY COUPON ===================== */

export const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  const validCoupon = await Coupon.findOne({
    name: coupon.trim(),

    expire: {
      $gt: Date.now(),
    },
  });

  if (!validCoupon) {
    return res.status(400).json({
      msg: "Invalid or expired coupon",
    });
  }

  const discountAmount = (cart.totalCartPrice * validCoupon.discount) / 100;

  cart.totalPriceAfterDiscount = cart.totalCartPrice - discountAmount;

  await cart.save();

  res.status(200).json({
    msg: "Coupon applied successfully",

    data: cart,
  });
});

/* ===================== GET CART ITEM ===================== */

export const getCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate(
    "cartItems.product",
    "name imageCover price priceAfterDiscount category subCategory",
  );

  if (!cart) {
    return res.status(404).json({
      msg: "Cart not found",
    });
  }

  const item = cart.cartItems.id(itemId);

  if (!item) {
    return res.status(404).json({
      msg: "Item not found",
    });
  }

  res.status(200).json({
    data: item,
  });
});
