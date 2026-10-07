import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import FactoryHandler from "./factoryhandler.js";
import User from "../model/userModel.js";
import upload from "../middleware/uploadImageMiddleware.js";
import { setToken } from "./authService.js";

const factory = new FactoryHandler(User);

export const uploadImage = upload("users").single("imageProfile");

export const setImagetoBody = (req, res, next) => {
  if (req.file.path) {
    req.body.imageProfile = req.file.path;
  }

  next();
};

export const createUser = factory.createOne;
export const getUser = factory.getOne;

export const getAllUser = factory.getAll;

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await User.findByIdAndUpdate(
    id,
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      imageProfile: req.body.imageProfile,
    },
    { new: true, runValidators: true },
  );

  if (!item) {
    return res.status(404).json({
      error: `This User with id ${id} was not found`,
    });
  }

  res.status(200).json({ data: item });
});

export const changePassword = asyncHandler(async (req, res) => {
  const item = await User.findByIdAndUpdate(
    req.use._id,
    {
      password: await bcrypt.hash(req.body.password, 10),
      changePasswordAt: Date.now(),
    },
    { new: true, runValidators: true },
  );

  if (!item) {
    return res.status(404).json({
      error: `This User with id ${id} was not found`,
    });
  }

  res.status(200).json({ data: item });
});

export const deleteUSer = factory.deleteOne;

export const getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

export const updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const item = await User.findByIdAndUpdate(
    req.user._id,
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true, runValidators: true },
  );

  const token = setToken(item._id);
  res.status(200).json({ data: item, token });
});

export const changeMyPassword = asyncHandler(async (req, res, next) => {
  const item = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 10),
      changePasswordAt: Date.now(),
    },
    { new: true, runValidators: true },
  );

  const token = setToken(item._id);

  res.status(200).json({ data: item, token });
});
