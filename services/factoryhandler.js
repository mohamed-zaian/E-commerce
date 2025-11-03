import asyncHandler from "express-async-handler";
import slugify from "slugify";
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
    res.status(200).json({
      msg: `The ${this.model.modelName} has been deleted successfully.`,
    });
  });

  // ✏️ updateOne
      updateOne = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const item = await this.model.findByIdAndUpdate(
          id,
          // eslint-disable-next-line node/no-unsupported-features/es-syntax
          { slug: slugify(req.body.name), ...req.body },
          { new: true, runValidators: true }
        );

    if (!item) {
      return res.status(404).json({
        error: `This ${this.model.modelName} with id ${id} was not found`,
      });
    }

    res.status(200).json({ data: item });
  });

  // 🔍 getOne
  getOne = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // ✅ populate لازم يتكتب قبل await
    let query = this.model.findById(id);
    if (req.populateOptions) query = query.populate(req.populateOptions);

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
    const apiFeature = new ApiFeature(this.model.find(), req.query)
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
    // slugify name لو موجود
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }

    const item = await this.model.create(req.body);

    res.status(201).json({ data: item }); 
  });
}

export default FactoryHandler;
