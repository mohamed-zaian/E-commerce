import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";

export const addAddress = asyncHandler(async (req, res) => {
  const { addresses } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: addresses },
    },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Address added to addresses", addresses: user.addresses });
});

export const removeAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: id } },
    },
    { new: true }
  );
  res.status(200).json({
    message: "Address removed from addresses",
    addresses: user.addresses,
  });
});

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("addresses");
  res.status(200).json({ addresses: user.addresses });
});
