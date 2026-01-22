import express from "express";
import { addToWishList, getWishList, removeFromWishList } from "../services/wishListService.js";

import { restrictTo  , protect} from "../services/authService.js";


const router = express.Router();

router.use(protect , restrictTo("user"));

router.route("/").post(addToWishList).get(getWishList);
router.route("/:id").delete(removeFromWishList);




export default router