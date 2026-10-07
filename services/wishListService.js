import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";

export const addToWishList = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: productId },
    },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Product added to wishlist", wishlist: user.wishlist });
});

export const removeFromWishList = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: id },
    },
    { new: true }
  );
    res
    .status(200)
    .json({
      message: "Product removed from wishlist",
      wishlist: user.wishlist,
    });
});

export const getWishList = asyncHandler(async (req, res) => 
{
console.log(req.user._id)
  const user = await User.findById(req.user._id).populate("wishlist");
  res.status(200).json({total : user.wishlist.length ,  data: user.wishlist   });

})  
