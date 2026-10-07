import mongoose from "mongoose";
import bcrypt from "bcrypt";

  
const schema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "the first name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "the last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "the email is required"],
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "the password is required"],
      minlength: [6, "Too short password"],
    },
    changePasswordAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,

  
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    
    orders: [

      {type: mongoose.Schema.Types.ObjectId,
      ref:"Order"}
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
      },
    ],
  },
  { timestamps: true },
);


schema.pre("save", async function (next) {
  // If password is NOT modified → do nothing
  if (!this.isModified("password")) return next();

  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);

  next();
});


const User = mongoose.model("User", schema);


export default User;
