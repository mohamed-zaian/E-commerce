import express from "express";
 
import { restrictTo  , protect} from "../services/authService.js";
import { addAddress , getAddresses , removeAddress} from '../services/addressService.js';


const router = express.Router();

router.use(protect , restrictTo("user"));

router.route("/").post(addAddress).get(getAddresses);
router.route("/:id").delete(removeAddress);




export default router