import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudnairy.js";

// Storage للصور
const setStorage = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => ({
      folder: folderName,
      public_id: `${Date.now()}-${file.originalname}`,
      format: "jpeg",
    }),
  });
  return storage;

}

 const upload = (folderName) => multer({ storage: setStorage(folderName) });

export default upload; 
