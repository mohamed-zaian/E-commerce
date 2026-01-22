import mongoose from "mongoose";

const schema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide Brand name"],
      unique: [true, "Brand name must be unique"],
    },
    slug: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

  
const Brand = mongoose.model("Brand", schema);

export default Brand;
