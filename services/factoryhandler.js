import asyncHandler from "express-async-handler";
import ApiFeature from "../utils/apiFeature.js";

class FactoryHandler {
  constructor(model) {
    this.model = model;
  }

  // 🗑️ deleteOne
  deleteOne = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await this.model.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        error: `${this.model.modelName} not found`,
      });
    }

    item.remove();
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
        query = this.model.findById(id).populate(populateOptions);
      } else {
        query = this.model.findById(id);
      }

      const item = await query;

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

    const apiFeature = new ApiFeature(this.model.find(filterObj), req.query)
      .search()
      .filtering()
      .sort()
      .paginate()
      .limitFields();

    const items = await apiFeature.mongooseQuery;

    res.status(200).json({
      result: items.length,
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
