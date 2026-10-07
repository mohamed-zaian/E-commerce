import mongoose from "mongoose";


const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "SubCategory must be unique"],
      minlength: [2, "To short SubCategory name"],
      maxlength: [32, "To long SubCategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },

  },

  { timestamps: true }
);

const subCategoryModel = mongoose.model("subCategory", schema);
export default subCategoryModel;
