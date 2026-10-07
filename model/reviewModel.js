  import mongoose from "mongoose";
  import Product from "./productModel.js";

  const schema = new mongoose.Schema({
    title: { type: String, required: true },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  });

  schema.pre(/^find/, function (next) {
    this.populate({
      path: "user",
      select: "name imageProfile",
    });
    next();
  });

  schema.statics.clacAveRatingAndQuntatiy = async function (productID) {
    const result = await this.aggregate([
      { $match: { product: productID } },
      {
        $group: {
          _id: "product",
          averageRating: { $avg: "$rating" },
          ratingQuantiy: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
  
      await Product.findByIdAndUpdate(productID, {
        ratingsAverage: result[0].averageRating,
        ratingQuantity: result[0].ratingQuantiy,
      });
    }
    else {
      await Product.findByIdAndUpdate(productID, {
        ratingsAverage: 0,
        ratingsQuantity: 0,
      })
    }
  };

  schema.post("save",async function ()
  {

    await this.constructor.clacAveRatingAndQuntatiy(this.product);
  })

  schema.post("remove", async function () {
    await this.constructor.clacAveRatingAndQuntatiy(this.product);
  });

  schema.post("save", async function () {
    await this.constructor.clacAveRatingAndQuntatiy(this.product);
  });
  const Review = mongoose.model("Review", schema);

  export default Review;
