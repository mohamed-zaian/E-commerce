import mongoose from "mongoose";
import bcrypt from "bcrypt";
  
const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "the name is required"],
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

    imageProfile: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      }
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String,
      }
    ]
  },
  { timestamps: true }
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
