import asyncHandler from "express-async-handler";
import ApiFeature from "../utils/apiFeature.js";

class FactoryHandler {
  constructor(model) {
    this.model = model;
  }

  // 🗑️ deleteOne
  deleteOne = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id)

    const item = await this.model.findByIdAndDelete(id);
console.log(item)
    if (!item) {
      return res.status(404).json({
        error: `${this.model.modelName} not found`,
      });
    }

    res.status(200).json({
      msg: `The ${this.model.modelName} has been deleted successfully.`,
    });
  });

  // ✏️ updateOne
  updateOne = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await this.model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        error: `This ${this.model.modelName} with id ${id} was not found`,
      });
    }
    await item.save();

    res.status(200).json({ data: item });
  });

  // 🔍 getOne
  getOne = (populateOptions) =>
    asyncHandler(async (req, res) => {
      const { id } = req.params;

      // ✅ populate لازم يتكتب قبل await

      let query;
      if (populateOptions) {
        query =  this.model.findById(id).populate(populateOptions);
      } else {
        query =  this.model.findById(id);
      }

      const item = await query;
      console.log("item", item);

      if (!item) {
        return res.status(404).json({
          error: `${this.model.modelName} not found`,
        });
      }

      res.status(200).json({ data: item });
    });

  // 📋 getAll
  getAll = asyncHandler(async (req, res) => {
    const filterObj =
      req.filter && typeof req.filter === "object" ? req.filter : {};


  const totalItems = await this.model.countDocuments(filterObj);
let apiFeature;
if(this.model.modelName ==="Order" )
{
   apiFeature = new ApiFeature(
    this.model.find(filterObj).sort("-createdAt"),
    req.query,
  )
    .search()
    .filtering()
    .paginate()
    .limitFields();
}
else {
 apiFeature = new ApiFeature(
  this.model.find(filterObj).sort("createdAt"),
  req.query,
)
  .search()
  .filtering()
  .paginate()
  .limitFields();

}



    const items = await apiFeature.mongooseQuery;

   const page = Number(req.query.page) || 1;

   const limit = Number(req.query.limit) || 15;

  res.status(200).json({
    result: items.length,

    totalItems,

    currentPage: page,

    totalPages: Math.ceil(totalItems / limit),

    data: items,
  });
  });

  // ➕ createOne
  createOne = asyncHandler(async (req, res) => {
    const item = await this.model.create(req.body);

    res.status(201).json({ data: item });
  });
}

export default FactoryHandler;
