import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order must be belong to user"],
    },
    customerName: {
      type: String,
    },
    customerEmail: {
      type: String,
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        name: String,
        size: String,
        color: String,
        quantity: Number,
        price: Number,
        image: String,
      },
    ],

    subtotal: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      firstName: String,
      lastName: String,
      address: String,
      apartment: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totalOrderPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    paymentMethodType: {
      type: String,
      enum: ["الدفع عند الاستلام", "إنستاباي"],
      default: "Cash on Delivery",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    estimatedDelivery: Date,
    trackingNumber: String,
  },
  { timestamps: true },
);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-2024-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

;

const Order = mongoose.model('Order', orderSchema);
export default Order;