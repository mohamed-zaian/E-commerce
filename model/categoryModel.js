import mongoose from "mongoose";

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide category name"],
      unique: [true, "Category name must be unique"],
    },
    slug: {
      type: String,
    },
    image: {
      type: String,
    },
  },{ timestamps: true }
);





const Category = mongoose.model("Category", schema);

export default Category;



