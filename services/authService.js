import asyncHandler from "express-async-handler";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../model/userModel.js";
import sendEmail from "../utils/send_email.js";

export const setToken = (id) => {
  const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRETIME,
  });
  return token;
};

export const signUP = asyncHandler(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = setToken(user._id);

  res.status(201).json({
    message: "User registered successfully",
    data: user,
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ msg: "inavlid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = setToken(user._id);

  res.status(200).json({
    message: "User registered successfully",
    data: user,
    token,
  });
});

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new Error("you are not login , please login to get access", 401)
    );
  }

  const decode = jwt.verify(token, process.env.JWT_SECRET);

  const { id } = decode;

  //  check if user exist

  const currentUser = await User.findById(id);
  console.log(currentUser);
  if (!currentUser) {
    return next(new Error("you user is not found ", 404));
  }

  //check if user change password after genert token

  if (currentUser.changePasswordAt) {
    const chnagePasswordTimeStanp = parseInt(
      currentUser.changePasswordAt.getTime() / 1000,
      10
    );

    if (chnagePasswordTimeStanp > decode.iat) {
      return next(new Error("you shoud login again "), 401);
    }
  }
  req.user = currentUser;

  next();
});

export const restrictTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new Error("you are not authorized to perform this action", 403));
    }
    next();
  });
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new Error("there is no user with this email", 404));
  }
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashCode = crypto.createHash("sha256").update(randomCode).digest("hex");

  user.passwordResetCode = hashCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  await sendEmail({
    email: user.email,
    subject: "Your password reset code (valid for 10 min)",
    text: `Your password reset code is ${randomCode}`,
  });
  res.status(200).json({
    message: "Password reset code sent to email",
  });
});

export const verifyPasswordCode = asyncHandler(async (req, res, next) => {
  const hashCode = crypto
    .createHash("sha256")
    .update(req.body.resetcode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new Error("Reset code is invalid or has expired", 400));
  }
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    message: "Reset code verified successfully",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user)
  {
    return next(new Error("there is no user with this email", 404));
  }
  if (!user.passwordResetVerified) {
    return next(new Error("Password reset not verified", 400));
  }
  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();

  res.status(200).json({
    message: "Password has been reset successfully",
  });
});