import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import Product from "../model/productModel.js";
import FactoryHandler from "./factoryhandler.js";
import Cart from "../model/cartModel.js";
import Order from "../model/orderModel.js";

const facctoryHandler = new FactoryHandler(Order);

const stripe = new Stripe(process.env.STRIPE_KEY);

export const createOrder = asyncHandler(async (req, res) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  const { cartId } = req.params;
  const cart = await Cart.findById(cartId);
  if (!cart) {
    return res.status(404).json({ msg: "ther is no cart" });
  }
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    await Cart.findByIdAndDelete(cartId);
  }
});

export const filterByLoggerUser = asyncHandler((req, res, next) => {
  if (req.user.role === "user") {
    req.filter = { user: req.user._id };
  }
  next();
});

export const getALlOrder = facctoryHandler.getAlll;

export const getSpacificOrder = facctoryHandler.getOne;

export const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "this order is not found" });
  }
  order.isPaid = true;
  order.paidAt = Date.now();

  const updateOrder = await order.save();

  res.status(200).json({ statue: "success", order: updateOrder });
});

export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: "this order is not found" });
  }
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updateOrder = await order.save();

  res.status(200).json({ statue: "success", order: updateOrder });
});

export const checkoutSession = asyncHandler(async (req, res) => {
  const taxPrice = 0;
  const shippingPrice = 0;
  const { cartId } = req.params;

  const cart = await Cart.findById(cartId);

  if (!cart) {
    return res.status(404).json({ msg: "there is no cart" });
  }

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: "Order Checkout",
          },
          unit_amount: Math.round(totalOrderPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: cartId,
  });

  res.status(200).json({
    status: "success",
    session,
  });
});
